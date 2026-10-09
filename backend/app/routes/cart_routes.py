from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.core.db import getsession
from backend.app.core.security import token_verify
from backend.app.schemas.cart_schemas import CartOut, CartItemCreate, CartItemUpdate
from backend.app.services.cart_services import CartServices
from backend.app.models.models import User

cartroute = APIRouter(prefix="/cart", tags=["cart"])

@cartroute.get("/view", response_model=CartOut)
def view_cart(user: User = Depends(token_verify), session: Session = Depends(getsession)):
    cart_service = CartServices(session)
    return cart_service.get_or_create_cart(user.id_user)

@cartroute.post("/add", response_model=CartOut)
def add_to_cart(body: CartItemCreate, user: User = Depends(token_verify), session: Session = Depends(getsession)):
    cart_service = CartServices(session)
    return cart_service.add_item(user.id_user, body.product_id, body.quantity)

@cartroute.put("/change/{item_id}", response_model=CartOut)
def change_item_cart(item_id: int, body: CartItemUpdate, user: User = Depends(token_verify), session: Session = Depends(getsession)):
    cart_service = CartServices(session)
    return cart_service.update_item(user.id_user, item_id, body.quantity)

@cartroute.delete("/delete/{item_id}", response_model=CartOut)
def delete_item(item_id: int, user: User = Depends(token_verify), session: Session = Depends(getsession)):
    cart_service = CartServices(session)
    return cart_service.delete_item(user.id_user, item_id)