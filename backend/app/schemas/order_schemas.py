
from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from decimal import Decimal
from typing import Any
from backend.app.schemas.item_order_schemas import ItemOrderResponse


class OrderCreate(BaseModel):
    id_address: int
    contact_name: str
    contact_email: str
    contact_number: str
    contact_cpf: str
    coupon_code: str | None = None


class OrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_order: int
    id_user: int
    id_address: int | None
    contact_name: str
    contact_email: str
    contact_number: str
    contact_cpf: str
    subtotal: Decimal
    total_items: int
    shipping_cost: Decimal
    shipping_address: dict[str, Any]
    discount_amount: Decimal
    total_price: Decimal
    status: str
    coupon_code: str | None
    created_at: datetime | None
    items: list[ItemOrderResponse] = Field(default_factory=list)
