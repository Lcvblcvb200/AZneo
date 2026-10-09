from pydantic import BaseModel, ConfigDict

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


class CommentPagination(BaseModel):
    comments: list[CommentOut]
    page: int
    limit: int
    total: int
    total_pages: int

    model_config = ConfigDict(from_attributes=True)