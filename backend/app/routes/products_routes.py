from fastapi import APIRouter, Depends
from backend.app.schemas.product_schemas import ProductCreate, ProductOut, ProductUpdate
from backend.app.core.db import getsession
from sqlalchemy.orm import Session
from backend.app.core.security import token_verify
from backend.app.services.products_services import ProductService
from backend.app.models.models import User

productroute = APIRouter(prefix="/products", tags=["products"])

@productroute.post("/register", response_model=ProductOut)
async def register_product(body: ProductCreate, session: Session = Depends(getsession), user: User = Depends(token_verify)):
    product_service = ProductService(session)
    registered_product = product_service.create_product(body.name, body.description, body.brand, body.price, body.image_url, body.stock)
    return registered_product

@productroute.get("/view", response_model=list[ProductOut])
async def view_products(session: Session = Depends(getsession), user: User = Depends(token_verify)):
    product_service = ProductService(session)
    product_list = product_service.get_products()
    return product_list

@productroute.get("/search", response_model=list[ProductOut])
async def view_products_by_name(name: str, session: Session = Depends(getsession), user: User = Depends(token_verify)):
    product_service = ProductService(session)
    return product_service.get_product_by_name(name)

@productroute.get("/product/{slug}", response_model=ProductOut)
async def view_product_by_slug(slug: str, session: Session = Depends(getsession)):
    product_service = ProductService(session)
    return product_service.get_product_by_slug(slug)

@productroute.put("/update/{product_id}", response_model=ProductOut)
async def update_product(product_id: int, body: ProductUpdate, session: Session = Depends(getsession), user: User = Depends(token_verify)):
    updated_product = ProductService(session)
    product_updated = updated_product.update_product(product_id, body.name, body.description, body.brand, body.price, body.image_url, body.stock)
    return product_updated 

@productroute.delete("/delete/{product_id}")
async def delete_product(product_id: int, user: User = Depends(token_verify), session: Session = Depends(getsession)):
    deleted_product = ProductService(session)
    product_deleted = deleted_product.delete_product(product_id)
    return product_deleted