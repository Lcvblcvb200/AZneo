from fastapi import HTTPException
from sqlalchemy.orm import Session
from decimal import Decimal
from backend.app.models.models import Codes
from backend.app.schemas.codes_schemas import CodeCreate


class CodeService:
    def __init__(self, session: Session):
        self.session = session

    def create_code(self, data: CodeCreate):
        code_verify = self.session.query(Codes).filter(Codes.is_active == True).count()
        if code_verify >= 5:
            raise HTTPException(status_code=400, detail="Limit Reached: Maximum of 5 active coupons")
        code_name = data.code.strip().upper()
        existing_code = (self.session.query(Codes).filter(Codes.code == code_name).first())
        if existing_code:
            raise HTTPException(status_code=400, detail="Coupon Already Exists")

        if data.discount <= Decimal("0.00"):
            raise HTTPException(status_code=400, detail="Invalid Discount Value")

        if data.discount_type == "percentage":
            if data.discount > Decimal("100"):
                raise HTTPException(status_code=400, detail="Percentage Discount Cannot Exceed 100")

        if data.usage_limit is not None and data.usage_limit <= 0:
            raise HTTPException(status_code=400, detail="Invalid Usage Limit")

        if data.minimum_order < Decimal("0.00"):
            raise HTTPException(status_code=400, detail="Invalid Minimum Order")

        new_code = Codes(code_name, data.discount, data.discount_type, data.expires_at, data.usage_limit, data.minimum_order, 0, True)

        self.session.add(new_code)
        self.session.commit()
        self.session.refresh(new_code)

        return new_code
    
    def get_codes(self):
        codes = (self.session.query(Codes).order_by(Codes.id_code.desc()).all())
        return codes
    
    def get_code_by_name(self, coupon: str):
        code = (self.session.query(Codes).filter(Codes.code == coupon.strip().upper()).first())
        if not code:
            raise HTTPException(status_code=404,detail="Coupon Not Found")

        return code

    def get_code_by_id(self, id_code: int):
        code = (self.session.query(Codes).filter(Codes.id_code == id_code).first())
        if not code:
            raise HTTPException(status_code=404, detail="Coupon Not Found")

        return code

    def deactivate_code(self, id_code: int):
        code = self.get_code_by_id(id_code)
        if not code.is_active:
            raise HTTPException(status_code=400,detail="Coupon Already Inactive")

        code.is_active = False

        self.session.commit()
        self.session.refresh(code)

        return code