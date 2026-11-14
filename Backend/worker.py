import os
import uuid

try:
    import pytesseract
except ImportError:
    pytesseract = None

try:
    import spacy
except ImportError:
    spacy = None

try:
    from PIL import Image
except ImportError:
    Image = None

try:
    from database.session import SessionLocal
    from database.models import EvidenceFile, ExtractedEntity, Relationships
except ImportError:
    SessionLocal = None
    EvidenceFile = None
    ExtractedEntity = None
    Relationships = None

if spacy is not None:
    try:
        nlp = spacy.load("en_core_web_sm")
        print("✅ spaCy model loaded successfully.")
    except OSError:
        print("❌ ERROR: spaCy model 'en_core_web_sm' not found. Did you run 'python -m spacy download en_core_web_sm'?")
        nlp = None
else:
    nlp = None


def perform_ocr(image_path: str) -> str:
    print(f"-> OCR: Starting OCR on {image_path}...")

    if pytesseract is None or Image is None:
        print("-> OCR Error: Tesseract or Pillow is not installed.")
        return ""

    if not image_path or not os.path.exists(image_path):
        print(f"-> OCR Error: File not found: {image_path}")
        return ""

    try:
        with Image.open(image_path) as img:
            text = pytesseract.image_to_string(img, lang="eng")
        print(f"-> OCR: Successfully extracted {len(text)} characters.")
        return text
    except pytesseract.TesseractNotFoundError:
        print("\n!!! ERROR: Tesseract is not installed or not in your PATH. Please install it. !!!")
        return ""
    except Exception as exc:
        print(f"-> OCR Error: Could not process image: {exc}")
        return ""


def perform_nlp_analysis(raw_text: str, evidence_id: str):
    if nlp is None:
        print("NLP Analysis skipped because the spaCy model failed to load.")
        return []

    if not raw_text or not raw_text.strip():
        print(f"-> NLP: No raw text to analyze for Evidence ID {evidence_id}.")
        return []

    print(f"-> NLP: Analyzing text for entities in Evidence ID {evidence_id}...")
    doc = nlp(raw_text)
    extracted_data = []

    for ent in doc.ents:
        entity_type = ent.label_
        if entity_type not in {"PERSON", "DATE", "GPE", "LOC"}:
            continue

        sentence = ent.sent.text if ent.sent else raw_text
        extracted_data.append(
            {
                "type": entity_type,
                "value": ent.text,
                "context": sentence,
            }
        )

    print(f"-> NLP: Extracted {len(extracted_data)} relevant entities.")
    return extracted_data


def save_analysis_to_db(evidence_id: str, entities: list):
    if SessionLocal is None or ExtractedEntity is None or Relationships is None:
        print("--- DATABASE WARNING: Database models/session are unavailable. Skipping persistence. ---")
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
                    print(f"   -> Relationship created between {entity1['value']} and {entity2['value']}")

        session.commit()
        print(f"--- SUCCESS: Analysis results saved for Evidence ID {evidence_id} to the database. ---")
    except Exception as exc:
        if hasattr(session, "rollback"):
            session.rollback()
        print(f"--- DATABASE ERROR: Failed to save analysis for {evidence_id}: {exc} ---")
    finally:
        if hasattr(session, "close"):
            session.close()


def process_evidence_task(evidence_id: str):
    print(f"\n[WORKER START] Starting processing for Evidence ID: {evidence_id}")

    if SessionLocal is None or EvidenceFile is None:
        print("[WORKER FAIL] Database session is not configured. Stopping pipeline.")
        return

    session = SessionLocal()
    try:
        evidence_record = session.query(EvidenceFile).filter(EvidenceFile.id == evidence_id).first()
    finally:
        session.close()

    if not evidence_record:
        print(f"[WORKER FAIL] Evidence record not found for ID: {evidence_id}. Stopping pipeline.")
        return

    storage_path = getattr(evidence_record, "storage_path", None)
    file_type = getattr(evidence_record, "file_type", None)

    if not storage_path:
        print(f"[WORKER FAIL] Evidence file has no storage path for ID: {evidence_id}. Stopping pipeline.")
        return

    print(f"Step 1: Found Evidence. File Path: {storage_path} | Type: {file_type}")

    try:
        raw_text = perform_ocr(storage_path)
    except Exception as exc:
        print(f"[WORKER FAIL] OCR failed for {evidence_id}: {exc}. Stopping pipeline.")
        return

    if not raw_text:
        print(f"[WORKER FAIL] OCR failed for {evidence_id}. Stopping pipeline.")
        return

    print("Step 3: Analyzing text for entities...")
    extracted_data = perform_nlp_analysis(raw_text, evidence_id)
    if not extracted_data:
        print(f"[WORKER FAIL] NLP analysis yielded no results for {evidence_id}.")
        return

    print("Step 4: Saving analysis results to the database...")
    save_analysis_to_db(evidence_id, extracted_data)
    print(f"[WORKER COMPLETE] Finished processing for Evidence ID: {evidence_id}")


if __name__ == "__main__":
    print("--- Background Worker Started ---")
    test_evidence_id = str(uuid.uuid4())
    process_evidence_task(test_evidence_id)
    print("\n--- Background Worker Finished Demonstration ---")
