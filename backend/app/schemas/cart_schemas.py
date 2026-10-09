from pydantic import BaseModel, ConfigDict, Field
from backend.app.schemas.product_schemas import ProductOut


class CartItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(gt=0)
    
    model_config = ConfigDict(from_attributes=True)

class CartItemUpdate(BaseModel):
    quantity: int = Field(gt=0)

    model_config = ConfigDict(from_attributes=True)


class CartItemOut(BaseModel):
    id_item: int
    quantity: int
    unit_price: float
    product: ProductOut

    model_config = ConfigDict(from_attributes=True)


class CartOut(BaseModel):
    id_cart: int
    items: list[CartItemOut]
    total: float

    model_config = ConfigDict(from_attributes=True)