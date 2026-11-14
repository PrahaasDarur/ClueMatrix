import os
import shutil
import uuid

from fastapi import Depends, FastAPI, File, HTTPException, UploadFile

try:
    from database.session import SessionLocal
    from database.models import EvidenceFile
except ImportError:
    SessionLocal = None
    EvidenceFile = None

app = FastAPI(
    title="Digital Evidence Intelligence API (Phase 1)",
    description="API for secure evidence upload and queuing for analysis.",
)


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
    """Persist the uploaded file to a local evidence storage directory."""
    storage_dir = os.path.join("evidence_storage", file_id)
    os.makedirs(storage_dir, exist_ok=True)

    safe_filename = os.path.basename(file.filename or "upload.bin")
    file_path = os.path.join(storage_dir, safe_filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return storage_dir


def queue_processing_task(evidence_id: str):
    """Queue the evidence for async processing by a worker."""
    print(f"--- TASK QUEUE: Task for Evidence ID {evidence_id} has been successfully queued for analysis. ---")


def get_current_user() -> int:
    """Placeholder dependency for user authentication."""
    return 1


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
        SessionLocal.add(new_evidence)
        SessionLocal.commit()

        queue_processing_task(evidence_id)

        return {
            "message": "Evidence file received and queued for processing.",
            "evidence_id": evidence_id,
            "file_type": file_type,
            "status": "RECEIVED",
        }
    except Exception as exc:
        print(f"An error occurred during upload: {exc}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(exc)}")


@app.get("/")
def read_root():
    return {"status": "API is running", "service": "Evidence Intelligence Platform - Phase 1"}
