from pydantic import BaseModel, ConfigDict
from decimal import Decimal

class ItemOrderBase(BaseModel):
    id_product: int
    quantity: int

class ItemOrderResponse(ItemOrderBase):
    model_config = ConfigDict(from_attributes=True)

    id_order_item: int
    id_order: int
    product_name: str
    unit_price: Decimal
    unit_discount: Decimal
    total_price: Decimal
