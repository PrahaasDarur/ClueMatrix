import os
from pathlib import Path
from io import BytesIO

<<<<<<< HEAD
import httpx
import pytesseract
import pymupdf as fitz
from PIL import Image

from database.session import SessionLocal
from database.models import EvidenceFile, ExtractedEntity


AI_SERVICE_URL = os.getenv(
    "AI_SERVICE_URL",
    "http://127.0.0.1:8000"
)


def update_evidence_status(evidence_id: str, status: str):
    with SessionLocal() as session:
        record = session.query(EvidenceFile).filter(
            EvidenceFile.id == evidence_id
        ).first()

        if record:
            record.status = status
            session.commit()


def extract_context(raw_text, start, end):
    if not isinstance(start, int) or not isinstance(end, int):
        return ""

    if start < 0 or end < start or end > len(raw_text):
        return ""

    left = max(0, start - 120)
    right = min(len(raw_text), end + 120)

    return raw_text[left:right].strip()


def extract_image_text(file_path):
    with Image.open(file_path) as image:
        text = pytesseract.image_to_string(
            image,
            lang="eng"
        )

    return [{
        "page_number": 1,
        "text": text,
        "method": "tesseract_ocr"
    }]


def extract_pdf_text(file_path):
    pages = []

    with fitz.open(file_path) as pdf:
        for index, page in enumerate(pdf):
            text = page.get_text("text")
            method = "pymupdf_text"

            # Use OCR for scanned or image-only pages.
            if len(text.strip()) < 20:
                pix = page.get_pixmap(
                    matrix=fitz.Matrix(2, 2)
                )

                with Image.open(
                    BytesIO(pix.tobytes("png"))
                ) as image:
                    text = pytesseract.image_to_string(
                        image,
                        lang="eng"
                    )

                method = "tesseract_ocr"

            pages.append({
                "page_number": index + 1,
                "text": text,
                "method": method
            })

    return pages


def extract_file_text(file_path, file_type):
    if not os.path.isfile(file_path):
        raise FileNotFoundError(
            f"Evidence file not found: {file_path}"
        )

    extension = Path(file_path).suffix.lower()

    if file_type == "pdf" or extension == ".pdf":
        return extract_pdf_text(file_path)

    if file_type == "image" or extension in {
        ".jpg", ".jpeg", ".png"
    }:
        return extract_image_text(file_path)

    raise ValueError(
        f"Unsupported evidence type: {file_type}"
    )


def analyze_with_ai_service(
    raw_text,
    evidence_id,
    source_filename,
    page_number=1
):
    if not raw_text.strip():
        return []
=======
# --------------------
# HTTP CLIENT
# --------------------
try:
    import httpx
except ImportError:
    httpx = None

# --------------------
# OCR MODEL
# --------------------
try:
    import pytesseract
except ImportError:
    pytesseract = None

try:
    from PIL import Image
except ImportError:
    Image = None

# --------------------
# NLP MODEL
# --------------------
try:
    import spacy
except ImportError:
    spacy = None

try:
    from transformers import pipeline
except ImportError:
    pipeline = None

# --------------------
# DATABASE MODEL
# --------------------
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

AI_SERVICE_URL = os.getenv("AI_SERVICE_URL", "http://127.0.0.1:8000")

# --------------------
# MODEL SETUP
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
# AI SERVICE
# --------------------
def analyze_with_ai_service(raw_text: str, evidence_id: str, source_filename: str) -> list:
    """Send extracted text to the AI service if it is available."""
    if httpx is None:
        raise RuntimeError("httpx is not installed.")
>>>>>>> d167be29d241f704b9985992cd6d7436fae9e4b2

    payload = {
        "evidence_id": evidence_id,
        "source_filename": source_filename,
        "page_number": page_number,
        "text": raw_text
    }

<<<<<<< HEAD
    response = httpx.post(
        f"{AI_SERVICE_URL}/analyze/evidence",
        json=payload,
        timeout=120.0
    )
=======
    response = httpx.post(f"{AI_SERVICE_URL}/analyze/evidence", json=payload, timeout=120.0)
    response.raise_for_status()

    result = response.json()
    entities = result.get("entities", [])
    if not isinstance(entities, list):
        raise ValueError("AI service response 'entities' must be a list.")
    return entities
>>>>>>> d167be29d241f704b9985992cd6d7436fae9e4b2

    response.raise_for_status()

<<<<<<< HEAD
    result = response.json()
    entities = result.get("entities")

    if not isinstance(entities, list):
        raise ValueError(
            "Invalid AI service response: entities must be a list."
        )

    return entities


def save_analysis_to_db(evidence_id, page_results):
    with SessionLocal() as session:
        for page_result in page_results:
            raw_text = page_result["text"]
            page_number = page_result["page_number"]

            for entity in page_result["entities"]:
                start = entity.get("start")
                end = entity.get("end")

                methods = entity.get("methods") or []

                ai_method = ", ".join(methods) or "unknown"

                extraction_method = (
                    f"{page_result['text_method']}; {ai_method}"
                )

                new_entity = ExtractedEntity(
                    evidence_file_id=evidence_id,
                    entity_type=entity["type"],
                    value=entity["value"],
                    context=extract_context(
                        raw_text,
                        start,
                        end
                    ),
                    start_offset=start,
                    end_offset=end,
                    page_number=page_number,
                    extraction_method=extraction_method
                )

                session.add(new_entity)

        session.commit()


def process_evidence_task(evidence_id: str):
    print(f"\n[WORKER START] Evidence ID: {evidence_id}")
=======
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
        results = nlp(raw_text).ents
    else:
        results = nlp(raw_text)

    extracted_data = []
    for entity in results:
        entity_type = getattr(entity, "label_", None) or entity.get("entity_group")
        entity_value = getattr(entity, "text", None) or entity.get("word")

        if entity_type in {"PERSON", "DATE", "GPE", "LOC"}:
            extracted_data.append(
                {
                    "type": entity_type,
                    "value": entity_value,
                    "context": raw_text,
                    "start": getattr(entity, "start_char", None) or entity.get("start", 0),
                    "end": getattr(entity, "end_char", None) or entity.get("end", 0),
                    "method": "local-nlp",
                }
            )

    print(f"NLP: Extracted {len(extracted_data)} entities.")
    return extracted_data


# --------------------
# DATABASE SECTION
# --------------------
def save_analysis_to_db(evidence_id: str, entities: list):
    """Save extracted entities to the configured database."""
    if SessionLocal is None or ExtractedEntity is None:
        print(f"[WORKER WARN] Database models are unavailable; skipping save for evidence {evidence_id}.")
        return

    session = SessionLocal()
    try:
        for entity in entities:
            new_entity = ExtractedEntity(
                evidence_file_id=evidence_id,
                entity_type=entity["type"],
                value=entity["value"],
                context=entity.get("context"),
            )
            session.add(new_entity)

        session.commit()
        print(f"--- SUCCESS: Analysis results saved for Evidence ID {evidence_id} to the database. ---")

    except Exception as exc:
        session.rollback()
        print(f"--- DATABASE ERROR: Failed to save analysis for {evidence_id}: {exc} ---")
    finally:
        session.close()



# --------------------
# PIPELINE SECTION
# --------------------
def process_evidence_task(evidence_id: str):
    """
    The main function executed by the background worker.
    This ties all the steps together: Fetch Metadata -> OCR -> NLP -> Relationships -> Timeline -> DB Write.
    """
    print(f"\n[WORKER START] Starting processing for Evidence ID: {evidence_id}")

    # --- 1. FETCH EVIDENCE METADATA ---
    session = SessionLocal()
    evidence_record = session.query(EvidenceFile).filter(EvidenceFile.id == evidence_id).first()
    session.close()

    if not evidence_record:
        print(f"[WORKER FAIL] Evidence record not found for ID: {evidence_id}. Stopping pipeline.")
        return

    storage_path = evidence_record.storage_path
    file_type = evidence_record.file_type
    print(f"Step 1: Found Evidence. File Path: {storage_path}")

>>>>>>> d167be29d241f704b9985992cd6d7436fae9e4b2

    # --- 2. OCR Step ---
    print(f"Step 2: Starting OCR on {storage_path}...")
    
    try:
<<<<<<< HEAD
        with SessionLocal() as session:
            record = session.query(EvidenceFile).filter(
                EvidenceFile.id == evidence_id
            ).first()

            if not record:
                raise ValueError(
                    f"Evidence record not found: {evidence_id}"
                )

            storage_path = record.storage_path
            file_type = record.file_type

        update_evidence_status(evidence_id, "PROCESSING")

        filename = os.path.basename(storage_path)

        print(f"[WORKER] Processing: {filename}")

        # STEP 1: Extract text from the evidence.
        pages = extract_file_text(
            storage_path,
            file_type
        )

        if not pages:
            raise ValueError("No pages found in evidence.")

        total_characters = 0
        total_entities = 0
        page_results = []

        # STEP 2: Send each page to the AI service.
        for page in pages:
            raw_text = page["text"]
            page_number = page["page_number"]

            total_characters += len(raw_text)

            print(
                f"[WORKER] Page {page_number}: "
                f"{len(raw_text)} characters"
            )

            entities = analyze_with_ai_service(
                raw_text=raw_text,
                evidence_id=evidence_id,
                source_filename=filename,
                page_number=page_number
            )

            total_entities += len(entities)

            page_results.append({
                "page_number": page_number,
                "text": raw_text,
                "text_method": page["method"],
                "entities": entities
            })

        if total_characters == 0:
            raise ValueError(
                "No text could be extracted from the evidence."
            )

        # STEP 3: Save extracted entities.
        save_analysis_to_db(
            evidence_id,
            page_results
        )

        # STEP 4: Mark processing as complete.
        update_evidence_status(
            evidence_id,
            "COMPLETE"
        )

        print(
            f"[WORKER COMPLETE] {evidence_id} | "
            f"Characters: {total_characters} | "
            f"Entities: {total_entities}"
        )

    except Exception as exc:
        print(
            f"[WORKER FAILED] {evidence_id}: {exc}"
        )

        try:
            update_evidence_status(
                evidence_id,
                "FAILED"
            )
        except Exception as status_error:
            print(
                f"[STATUS UPDATE FAILED] {status_error}"
            )
=======
        raw_text = perform_ocr(storage_path) 
    except Exception as e:
        print(f"[WORKER FAIL] OCR failed for {evidence_id}: {e}. Stopping pipeline.")
        return

    if not raw_text:
        print(f"[WORKER FAIL] OCR failed for {evidence_id}. Stopping pipeline.")
        return

    # --- 3. NLP Step ---
    print(f"Step 3: Analyzing text for entities...")
    extracted_data = perform_nlp_analysis(raw_text, evidence_id)

    if not extracted_data:
        print(f"[WORKER FAIL] NLP analysis yielded no results for {evidence_id}.")
        return

    # --- 4. Relationship Logic ---
    print("Step 4: Analyzing entities for connections...")
    save_analysis_to_db(evidence_id, extracted_data) 

    # --- 5. Timeline Generation (The New Step) ---
    print("Step 5: Generating Incident Timeline...")
    
    # --- REAL TIMELINE LOGIC GOES HERE ---
    
    # *** PLACEHOLDER for now ***
    timeline_summary = "Timeline generation logic initialized. Events would be sorted here."
    print(f"\n[Timeline Summary]: {timeline_summary}")
    
    # In a real system, you would now create the IncidentTimeline record here, 
    # linking it back to the evidence_id.

    print(f"[WORKER COMPLETE] Finished processing for Evidence ID: {evidence_id}")




if __name__ == "__main__":
    print("Background worker started")
    test_evidence_id = str(uuid.uuid4())
    process_evidence_task(test_evidence_id)
    print("Background worker finished")
>>>>>>> d167be29d241f704b9985992cd6d7436fae9e4b2
