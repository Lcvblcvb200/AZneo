from pydantic import BaseModel, ConfigDict
from backend.app.schemas.comment_schemas import CommentPagination
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