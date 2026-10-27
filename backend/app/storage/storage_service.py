from uuid import uuid4
from pathlib import Path
from fastapi import UploadFile, HTTPException
from backend.app.storage.storage import supabase

class StorageService:
    BUCKET = "azneo-images"
    ALLOWED_TYPES = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp"}
    MAX_FILE_SIZE = 5 * 1024 * 1024 

    def __init__(self):
        self.bucket = supabase.storage.from_(self.BUCKET)

    def upload_image(self, file: UploadFile, folder: str) -> str:

        if folder not in ("products", "comments"):
            raise HTTPException(status_code=400, detail="Invalid Folder")
        if file.content_type not in self.ALLOWED_TYPES:
            raise HTTPException(status_code=400, detail="Invalid Image Format")
        content = file.file.read()

        if not content or len(content) > self.MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail="No Image Or Bigger Than 5MB")
        valid_signature = {"image/jpeg": content.startswith(b"\xff\xd8\xff"), "image/png": content.startswith(b"\x89PNG\r\n\x1a\n"), "image/webp": (content.startswith(b"RIFF")and content[8:12] == b"WEBP")
        }

        if not valid_signature[file.content_type]:
            raise HTTPException(status_code=400, detail="The Content Is Invalid")

        extension = self.ALLOWED_TYPES[file.content_type]
        filename = f"{uuid4()}{extension}"
        path = f"{folder}/{filename}"

        self.bucket.upload(path=path, file=content, file_options={"content-type": file.content_type})

        return path

    def get_image_url(self, path: str) -> str:
        return self.bucket.get_public_url(path)

    def delete_image(self, path: str) -> None:
        if not path or not path.startswith(("products/", "comments/")):
            raise HTTPException(status_code=400, detail="Invalid Path")
        
        self.bucket.remove([path])