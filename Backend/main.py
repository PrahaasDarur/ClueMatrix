import os
import shutil
import uuid

try:
    import spacy
except ImportError:
    spacy = None

from fastapi import Depends, FastAPI, File, HTTPException, UploadFile
from pydantic import BaseModel

try:
    from database.session import SessionLocal
    from database.models import EvidenceFile
except ImportError:
    SessionLocal = None
    EvidenceFile = None

# --------------------
# NLP MODEL
# --------------------
if spacy is not None:
    try:
        nlp = spacy.load("en_core_web_sm")
        print("spaCy model loaded successfully.")
    except OSError:
        nlp = None
        print("spaCy model 'en_core_web_sm' is not installed.")
else:
    nlp = None
    print("spaCy is not installed.")

NER_LABELS = {
    "PERSON",
    "ORG",
    "GPE",
    "LOC",
    "FAC",
    "DATE",
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
    """Save an uploaded file to local storage and return its path."""
    storage_dir = os.path.join("evidence_storage", file_id)
    os.makedirs(storage_dir, exist_ok=True)

    safe_filename = os.path.basename(file.filename or "upload.bin")
    file_path = os.path.join(storage_dir, safe_filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return file_path


# --------------------
# QUEUE / AUTH
# --------------------
def queue_processing_task(evidence_id: str):
    """Queue the evidence for async processing by a worker."""
    print(f"Queue created for Evidence ID: {evidence_id}")


def get_current_user() -> int:
    """Placeholder dependency for user authentication."""
    return 1


# --------------------
# API ENDPOINTS
# --------------------
@app.post("/api/evidence/upload", status_code=202)
async def upload_evidence(
    file: UploadFile = File(...),
    user_id: int = Depends(get_current_user),
):
    """Receive a file, save it, and queue it for downstream analysis."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided.")

    if SessionLocal is None or EvidenceFile is None:
        raise HTTPException(status_code=500, detail="Database is not configured.")

    file_type = determine_file_type(file.filename)
    evidence_id = str(uuid.uuid4())

    try:
        storage_path = save_file_to_storage(file, evidence_id)

        new_evidence = EvidenceFile(
            id=evidence_id,
            user_id=user_id,
            storage_path=storage_path,
            file_type=file_type,
            status="RECEIVED",
        )

        session = SessionLocal()
        try:
            session.add(new_evidence)
            session.commit()
        finally:
            session.close()

        queue_processing_task(evidence_id)

        return {
            "message": "Evidence file received and queued for processing.",
            "evidence_id": evidence_id,
            "file_type": file_type,
            "status": "RECEIVED",
        }
    except Exception as exc:
        print(f"Upload error: {exc}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(exc)}")


@app.get("/")
def read_root():
    return {"status": "API is running", "service": "Evidence Intelligence Platform - Phase 1"}


@app.post("/analyze/ner")
async def analyze_ner(request: EntityRequest):
    """Extract named entities from evidence text."""
    if nlp is None:
        raise HTTPException(status_code=500, detail="spaCy model is not available.")

    doc = nlp(request.text)
    extracted_entities = []

    for entity in doc.ents:
        if entity.label_ not in NER_LABELS:
            continue

        extracted_entities.append(
            {
                "type": entity.label_,
                "value": entity.text,
                "start": entity.start_char,
                "end": entity.end_char,
                "evidence_id": request.evidence_id,
                "source_filename": request.source_filename,
                "page_number": request.page_number,
                "method": "spaCy NER",
            }
        )

    entity_counts = {}
    for entity in extracted_entities:
        entity_type = entity["type"]
        entity_counts[entity_type] = entity_counts.get(entity_type, 0) + 1

    return {
        "evidence_id": request.evidence_id,
        "source_filename": request.source_filename,
        "total_entities": len(extracted_entities),
        "entity_counts": entity_counts,
        "entities": extracted_entities,
        "processing": {
            "method": "spaCy en_core_web_sm",
            "status": "completed",
        },
    }
