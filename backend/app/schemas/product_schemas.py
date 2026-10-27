from pydantic import BaseModel, ConfigDict, field_validator
from backend.app.schemas.comment_schemas import CommentPagination
from backend.app.storage.storage_service import StorageService


class ProductOut(BaseModel):
    id_product: int
    product_name: str
    description: str
    brand: str
    price: float
    stock: int
    image_url: str | None = None
    slug: str
    category: str

    model_config = ConfigDict(from_attributes=True)

    @field_validator("image_url")
    @classmethod
    def convert_image_url(cls, value: str | None) -> str | None:
        if value is None:
            return None

        if value.startswith("products/"):
            return StorageService().get_image_url(value)

        return value


class ProductPagination(BaseModel):
    products: list[ProductOut]
    page: int
    limit: int
    total: int
    total_pages: int

    model_config = ConfigDict(from_attributes=True)


class ProductDetailOut(BaseModel):
    product: ProductOut
    comments: CommentPagination

    model_config = ConfigDict(from_attributes=True)