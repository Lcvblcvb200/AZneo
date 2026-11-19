
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.core.db import getsession
from backend.app.services.order_services import OrderService
from backend.app.schemas.order_schemas import OrderCreate, OrderResponse
from backend.app.models.models import User
from backend.app.core.security import token_verify

orderroute = APIRouter(prefix="/orders", tags=["Orders"])

@orderroute.post("/checkout", response_model=OrderResponse)
def checkout(data: OrderCreate, session: Session = Depends(getsession), user: User = Depends(token_verify)):
    order_service = OrderService(session)
    order = order_service.checkout(user.id_user, data.id_address, data.coupon_code)
    return order
