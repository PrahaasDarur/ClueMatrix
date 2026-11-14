import os
import shutil
import uuid

# --------------------
# NLP MODEL
# --------------------
try:
    import spacy
except ImportError:
    spacy = None

try:
    from transformers import pipeline as transformers_pipeline
except ImportError:
    transformers_pipeline = None

from fastapi import BackgroundTasks, Depends, FastAPI, File, HTTPException, UploadFile
from pydantic import BaseModel

from database.models import EvidenceFile
from database.session import SessionLocal
from worker import process_evidence_task

nlp = None
if spacy is not None:
    try:
        nlp = spacy.load("en_core_web_sm")
        print("spaCy model loaded successfully.")
    except OSError:
        print("spaCy model 'en_core_web_sm' is not installed; attempting transformer fallback.")

if nlp is None and transformers_pipeline is not None:
    try:
        nlp = transformers_pipeline(
            "token-classification",
            model="dslim/bert-base-NER",
            aggregation_strategy="simple",
        )
        print("Transformer NER model loaded successfully.")
    except Exception as exc:
        print(f"Transformer NER model failed to load: {exc}")

if nlp is None:
    print("No NLP model is currently available.")

NER_LABELS = {
    "PERSON",
    "ORG",
    "GPE",
    "LOC",
    "FAC",
    "DATE",
}

LABEL_ALIASES = {
    "PER": "PERSON",
    "PERSON": "PERSON",
    "ORG": "ORG",
    "GPE": "GPE",
    "LOC": "LOC",
    "FAC": "FAC",
    "DATE": "DATE",
}


class EntityRequest(BaseModel):
    text: str
    evidence_id: str
    source_filename: str | None = None
    page_number: int | None = None


app = FastAPI(
    title="Digital Evidence Intelligence API (Phase 1)",
    description="API for secure evidence upload and queuing for analysis.",
)


# --------------------
# FILE HANDLING
# --------------------
def determine_file_type(filename: str) -> str:
    """Determine the file type based on the extension."""
    ext = os.path.splitext(filename)[1].lower()
    if ext in {".jpg", ".png", ".jpeg"}:
        return "image"
    if ext == ".pdf":
        return "pdf"
    if ext == ".txt":
        return "text"
    return "unknown"


def save_file_to_storage(file: UploadFile, file_id: str) -> str:
    """Save evidence and return the complete path to the file."""
    storage_dir = os.path.join("evidence_storage", file_id)
    os.makedirs(storage_dir, exist_ok=True)

    safe_filename = os.path.basename(file.filename or "upload.bin")
    file_path = os.path.join(storage_dir, safe_filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return os.path.abspath(file_path)


# --------------------
# AUTH / QUEUE
# --------------------
def get_current_user() -> int:
    """Placeholder dependency for user authentication."""
    return 1


# --------------------
# API ENDPOINTS
# --------------------
@app.post("/api/evidence/upload", status_code=202)
async def upload_evidence(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    user_id: int = Depends(get_current_user),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided.")

    file_type = determine_file_type(file.filename)
    if file_type not in {"image", "pdf", "text"}:
        raise HTTPException(status_code=415, detail="Only JPG, JPEG, PNG, PDF and TXT files are supported.")

    evidence_id = str(uuid.uuid4())
    storage_path = None
    db = SessionLocal()

    try:
        storage_path = save_file_to_storage(file, evidence_id)

        new_evidence = EvidenceFile(
            id=evidence_id,
            user_id=user_id,
            storage_path=storage_path,
            file_type=file_type,
            status="RECEIVED",
        )

        db.add(new_evidence)
        db.commit()

        background_tasks.add_task(process_evidence_task, evidence_id)

        return {
            "message": "Evidence received and processing scheduled.",
            "evidence_id": evidence_id,
            "file_type": file_type,
            "status": "RECEIVED",
        }
    except Exception as exc:
        db.rollback()
        if storage_path and os.path.isfile(storage_path):
            os.remove(storage_path)
        raise HTTPException(status_code=500, detail=f"Evidence upload failed: {str(exc)}")
    finally:
        db.close()


@app.get("/")
def read_root():
    return {"status": "API is running", "service": "Evidence Intelligence Platform - Phase 1"}


def _extract_entities_from_model(text: str):
    if nlp is None:
        return []

    if hasattr(nlp, "ents"):
        results = nlp(text).ents
    else:
        results = nlp(text)

    extracted_entities = []
    for entity in results:
        if hasattr(entity, "label_"):
            entity_label = entity.label_
            entity_value = entity.text
            start = getattr(entity, "start_char", 0)
            end = getattr(entity, "end_char", 0)
            method = "spaCy NER"
        else:
            entity_label = entity.get("entity_group") or entity.get("entity") or "MISC"
            entity_value = entity.get("word") or entity.get("entity") or ""
            start = entity.get("start", 0)
            end = entity.get("end", 0)
            method = "transformers NER"

        normalized_label = LABEL_ALIASES.get(entity_label, entity_label)
        if normalized_label not in NER_LABELS and entity_label not in {"MISC", "ORG", "PER", "LOC", "GPE", "PERSON"}:
            continue

        extracted_entities.append(
            {
                "type": normalized_label if normalized_label in NER_LABELS else "MISC",
                "value": entity_value,
                "start": start,
                "end": end,
                "method": method,
            }
        )

    return extracted_entities


@app.post("/analyze/ner")
@app.post("/analyze/evidence")
async def analyze_ner(request: EntityRequest):
    if nlp is None:
        raise HTTPException(status_code=503, detail="No NLP model is available. Install a spaCy model or enable the transformer fallback.")

    extracted_entities = _extract_entities_from_model(request.text)
    for entity in extracted_entities:
        entity["evidence_id"] = request.evidence_id
        entity["source_filename"] = request.source_filename
        entity["page_number"] = request.page_number

    entity_counts = {}
    for entity in extracted_entities:
        entity_type = entity["type"]
        entity_counts[entity_type] = entity_counts.get(entity_type, 0) + 1

    method_name = "spaCy en_core_web_sm" if hasattr(nlp, "pipe_names") else "transformers dslim/bert-base-NER"

    return {
        "evidence_id": request.evidence_id,
        "source_filename": request.source_filename,
        "total_entities": len(extracted_entities),
        "entity_counts": entity_counts,
        "entities": extracted_entities,
        "processing": {
            "method": method_name,
            "status": "completed",
        },
    }

