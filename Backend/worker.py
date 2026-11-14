import os
import uuid

# OCR dependencies
try:
    import pytesseract
except ImportError:
    pytesseract = None

try:
    from PIL import Image
except ImportError:
    Image = None

# NLP dependencies
try:
    import spacy
except ImportError:
    spacy = None

try:
    from transformers import pipeline
except ImportError:
    pipeline = None

# Database dependencies
try:
    from database.models import Base, EvidenceFile, ExtractedEntity, Relationships
    from database.session import SessionLocal, engine
except ImportError:
    Base = None
    SessionLocal = None
    engine = None
    EvidenceFile = None
    ExtractedEntity = None
    Relationships = None

# --------------------
# NLP MODEL
# --------------------
spacy_nlp = None
transformer_nlp = None

if spacy is not None:
    try:
        spacy_nlp = spacy.load("en_core_web_sm")
        print("spaCy model loaded successfully.")
    except OSError:
        print("spaCy model 'en_core_web_sm' not found.")

if pipeline is not None:
    try:
        transformer_nlp = pipeline("token-classification", model="dslim/bert-base-NER")
        print("Transformer NER model loaded successfully.")
    except Exception as exc:
        print(f"Transformer NER model failed to load: {exc}")

nlp = spacy_nlp or transformer_nlp


# --------------------
# OCR SECTION
# --------------------
def perform_ocr(image_path: str) -> str:
    """Extract text from an image using Tesseract OCR."""
    print(f"OCR: Starting OCR on {image_path}...")

    if pytesseract is None or Image is None:
        print("OCR Error: Tesseract or Pillow is not installed.")
        return ""

    if not image_path or not os.path.isfile(image_path):
        print(f"OCR Error: File not found: {image_path}")
        return ""

    try:
        with Image.open(image_path) as img:
            text = pytesseract.image_to_string(img, lang="eng")
        print(f"OCR: Extracted {len(text)} characters.")
        return text
    except pytesseract.TesseractNotFoundError:
        print("OCR Error: Tesseract is not installed or not in PATH.")
        return ""
    except Exception as exc:
        print(f"OCR Error: Could not process image: {exc}")
        return ""


# --------------------
# NLP SECTION
# --------------------
def perform_nlp_analysis(raw_text: str, evidence_id: str):
    """Extract named entities from OCR text."""
    if nlp is None:
        print("NLP analysis skipped because the model failed to load.")
        return []

    if not raw_text or not raw_text.strip():
        print(f"NLP: No text to analyze for Evidence ID {evidence_id}.")
        return []

    print(f"NLP: Analyzing text for Evidence ID {evidence_id}...")

    if hasattr(nlp, "ents"):
        doc = nlp(raw_text)
        results = doc.ents
    else:
        results = nlp(raw_text)

    extracted_data = []
    for entity in results:
        entity_type = getattr(entity, "label_", None) or entity.get("entity_group")
        entity_value = getattr(entity, "text", None) or entity.get("word")
        context = raw_text

        if entity_type in {"PERSON", "DATE", "GPE", "LOC"}:
            extracted_data.append(
                {
                    "type": entity_type,
                    "value": entity_value,
                    "context": context,
                }
            )

    print(f"NLP: Extracted {len(extracted_data)} entities.")
    return extracted_data


# --------------------
# DATABASE SECTION
# --------------------
def save_analysis_to_db(evidence_id: str, entities: list):
    """Persist entities and relationships to the database."""
    if SessionLocal is None or ExtractedEntity is None or Relationships is None:
        print("Database models are unavailable. Skipping persistence.")
        return

    session = SessionLocal()
    try:
        for entity in entities:
            new_entity = ExtractedEntity(
                evidence_file_id=evidence_id,
                entity_type=entity["type"],
                value=entity["value"],
                context=entity["context"],
            )
            session.add(new_entity)
            session.flush()
            entity["id"] = new_entity.id

        entities_by_context = {}
        for entity in entities:
            entities_by_context.setdefault(entity["context"], []).append(entity)

        for entity_list in entities_by_context.values():
            if len(entity_list) < 2:
                continue

            for i in range(len(entity_list)):
                for j in range(i + 1, len(entity_list)):
                    entity1 = entity_list[i]
                    entity2 = entity_list[j]

                    new_rel = Relationships(
                        source_entity_id=entity1["id"],
                        target_entity_id=entity2["id"],
                        relationship_type="CO_OCCURRED_IN_SENTENCE",
                        confidence_score=90,
                    )
                    session.add(new_rel)

        session.commit()
        print(f"Analysis saved for Evidence ID {evidence_id}.")
    except Exception as exc:
        if hasattr(session, "rollback"):
            session.rollback()
        print(f"Database error for {evidence_id}: {exc}")
    finally:
        if hasattr(session, "close"):
            session.close()


# --------------------
# PIPELINE SECTION
# --------------------
def process_evidence_task(evidence_id: str):
    """Run the evidence-processing pipeline for one record."""
    if SessionLocal is None or EvidenceFile is None or Base is None or engine is None:
        print(f"Worker failed: database configuration is unavailable for {evidence_id}.")
        return

    Base.metadata.create_all(bind=engine)
    print(f"Worker started for Evidence ID: {evidence_id}")

    session = SessionLocal()
    try:
        evidence_record = session.query(EvidenceFile).filter(EvidenceFile.id == evidence_id).first()
    finally:
        session.close()

    if not evidence_record:
        print(f"Worker failed: evidence record not found for {evidence_id}.")
        return

    storage_path = evidence_record.storage_path
    file_type = evidence_record.file_type
    print(f"Evidence found: {storage_path} | Type: {file_type}")

    try:
        raw_text = perform_ocr(storage_path)
    except Exception as exc:
        print(f"Worker failed during OCR for {evidence_id}: {exc}")
        return

    if not raw_text:
        print(f"Worker failed: OCR produced no text for {evidence_id}.")
        return

    extracted_data = perform_nlp_analysis(raw_text, evidence_id)
    if not extracted_data:
        print(f"Worker failed: NLP produced no entities for {evidence_id}.")
        return

    save_analysis_to_db(evidence_id, extracted_data)
    print(f"Worker complete for Evidence ID: {evidence_id}")


if __name__ == "__main__":
    print("Background worker started")
    test_evidence_id = str(uuid.uuid4())
    process_evidence_task(test_evidence_id)
    print("Background worker finished")
