from pydantic import BaseModel, ConfigDict, field_validator
from backend.app.storage.storage_service import StorageService

class CommentAuthor(BaseModel):
    id_user: int
    name: str

    model_config = ConfigDict(from_attributes=True)


class CommentOut(BaseModel):
    id_comment: int
    id_product: int
    content: str
    image_url: str | None = None
    rating: float
    user: CommentAuthor

    model_config = ConfigDict(from_attributes=True)

    @field_validator("image_url")
    @classmethod
    def convert_image_url(cls, value: str | None) -> str | None:
        if value is None:
            return None
    
        if value.startswith("comments/"):
            return StorageService().get_image_url(value)
    
        return value


class CommentPagination(BaseModel):
    comments: list[CommentOut]
    page: int
    limit: int
    total: int
    total_pages: int

    model_config = ConfigDict(from_attributes=True)