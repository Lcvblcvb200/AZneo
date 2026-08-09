from pydantic import BaseModel, ConfigDict
class ProductOut(BaseModel):
    id_product: int
    product_name: str
    description: str
    brand: str
    price: float
    stock: int
    image_url: str | None = None
    slug: str

    model_config = ConfigDict(from_attributes=True)