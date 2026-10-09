from fastapi import APIRouter, Depends, Form, File, UploadFile
from backend.app.schemas.product_schemas import ProductOut, ProductPagination, ProductDetailOut
from backend.app.core.db import getsession
from sqlalchemy.orm import Session
from backend.app.core.storage import save_product_image
from backend.app.core.security import token_verify, is_admin
from backend.app.services.products_services import ProductService
from backend.app.services.comment_services import CommentServices
from backend.app.models.models import User

productroute = APIRouter(prefix="/products", tags=["products"])

@productroute.post("/register", response_model=ProductOut)
def register_product(name: str = Form(...), description: str = Form(...), brand: str = Form(...), price: float = Form(...), stock: int = Form(...), image: UploadFile = File(...), barcode: str = Form(...), category: str = Form(...), session: Session = Depends(getsession), user: User = Depends(is_admin)):
    product_service = ProductService(session)
    image_url = save_product_image(image)
    registered_product = product_service.create_product(name, description, brand, price, image_url, stock, barcode, category)
    return registered_product

@productroute.get("/view", response_model=ProductPagination)
def view_products(session: Session = Depends(getsession), user: User = Depends(token_verify)):
    product_service = ProductService(session)
    product_list = product_service.get_products()
    return product_list

@productroute.get("/search", response_model=list[ProductOut])
def view_products_by_name(name: str, session: Session = Depends(getsession), user: User = Depends(token_verify)):
    product_service = ProductService(session)
    return product_service.get_product_by_name(name)

@productroute.get("/product/{slug}", response_model=ProductDetailOut)
def view_product_by_slug(slug: str, session: Session = Depends(getsession), user: User = Depends(token_verify)):
    product_service = ProductService(session)
    comment_service = CommentServices(session)
    product = product_service.get_product_by_slug(slug)
    comments = comment_service.view_comments(product.id_product)
    return {
        "product": product,
        "comments": comments
    }

@productroute.put("/update/{product_id}", response_model=ProductOut)
def update_product(product_id: int, name: str | None = Form(None), description: str | None = Form(None), brand: str | None = Form(None), price: float | None = Form(None), stock: int | None = Form(None), image: UploadFile | None = File(None), barcode: str | None = Form(None), category: str | None = Form(None), session: Session = Depends(getsession), user: User = Depends(is_admin)):
    updated_product = ProductService(session)
    image_url = save_product_image(image) if image else None
    product_updated = updated_product.update_product(product_id, name, description, brand, price, image_url, stock, barcode, category)
    return product_updated 

@productroute.delete("/delete/{product_id}")
def delete_product(product_id: int, user: User = Depends(is_admin), session: Session = Depends(getsession)):
    deleted_product = ProductService(session)
    product_deleted = deleted_product.delete_product(product_id)
    return product_deleted