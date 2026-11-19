from pydantic import BaseModel, ConfigDict
from Decimal import Decimal

class CodeCreate(BaseModel):
    coupon: str
    discount: Decimal
    discount_type: str
    expires_at: int
    usage_limit: int

class CodeResponse(BaseModel):
    coupon: str
    discount: Decimal 
    discount_type: str
    expires_at: int
    used_count = int
    minimum_order = int
    usage_limit: int

