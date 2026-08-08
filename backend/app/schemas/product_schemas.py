from pydantic import BaseModel, ConfigDict

class ProductCreate(BaseModel):
    name: str
    description: str
    brand: str
    price: float
    image_url: str
    stock: int

class ProductUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    brand: str | None = None
    price: float | None = None
    image_url: str | None = None
    stock: int | None = None

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