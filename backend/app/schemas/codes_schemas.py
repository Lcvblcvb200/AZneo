from pydantic import BaseModel, ConfigDict, Field
from decimal import Decimal
from datetime import datetime
from typing import Literal


class CodeCreate(BaseModel):
    code: str
    discount: Decimal
    discount_type: Literal["percentage", "fixed"]
    expires_at: datetime | None = None
    usage_limit: int | None = None
    minimum_order: Decimal = Decimal("0.00")
    is_active: bool = True


class CodeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_code: int
    code: str
    discount: Decimal
    discount_type: str
    expires_at: datetime | None
    used_count: int
    minimum_order: Decimal
    usage_limit: int | None
    is_active: bool