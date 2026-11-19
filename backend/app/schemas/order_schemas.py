from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from decimal import Decimal
from typing import Any
from backend.app.schemas.item_order_schemas import ItemOrderResponse

class OrderCreate(BaseModel):
    id_address: int
    coupon_code: str | None = None
class OrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_order: int
    id_user: int
    id_address: int | None
    id_code: int | None
    contact_name: str
    contact_email: str
    contact_document: str
    is_company: bool
    subtotal: Decimal
    total_items: int
    shipping_cost: Decimal
    shipping_address: dict[str, Any]
    coupon_code: str | None
    discount_amount: Decimal
    total_price: Decimal
    status: str
    created_at: datetime

    items: list[ItemOrderResponse] = Field(default_factory=list)
class ItemOrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_order_item: int
    id_order: int
    id_product: int
    product_name: str
    quantity: int
    unit_price: Decimal
    unit_discount: Decimal
    total_price: Decimal
