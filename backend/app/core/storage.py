import os
import uuid
from fastapi import UploadFile, HTTPException

UPLOAD_DIR = "static/products"
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}


def save_product_image(file: UploadFile) -> str:
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=415, detail="Unsupported image type")

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    extension = file.filename.rsplit(".", 1)[-1]
    filename = f"{uuid.uuid4().hex}.{extension}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    with open(filepath, "wb") as buffer:
        buffer.write(file.file.read())

    return f"/static/products/{filename}"