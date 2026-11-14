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

from fastapi import BackgroundTasks, Depends, FastAPI, File, HTTPException, UploadFile
from pydantic import BaseModel

from database.models import EvidenceFile
from database.session import SessionLocal
from worker import process_evidence_task

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


@app.post("/analyze/ner")
async def analyze_ner(request: EntityRequest):
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
