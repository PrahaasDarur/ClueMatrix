import os
from pathlib import Path
from io import BytesIO

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

    payload = {
        "evidence_id": evidence_id,
        "source_filename": source_filename,
        "page_number": page_number,
        "text": raw_text
    }

    response = httpx.post(
        f"{AI_SERVICE_URL}/analyze/evidence",
        json=payload,
        timeout=120.0
    )

    response.raise_for_status()

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

    try:
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
