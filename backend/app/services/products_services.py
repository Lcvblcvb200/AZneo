from fastapi import HTTPException, UploadFile
from sqlalchemy import or_
from sqlalchemy.orm import Session
from slugify import slugify
from backend.app.models.models import Product, Item_Cart
from backend.app.storage.storage_service import StorageService
import math

class ProductService:
    def __init__(self, session: Session):
        self.session = session
        self.storage = StorageService()

    def create_product(self, name: str, description: str, brand: str, price: float, image_url: UploadFile, stock: int, barcode: str, category: str) -> Product:
        slug = slugify(name)
        queryproduct = self.session.query(Product).filter(or_(Product.slug == slug, Product.barcode == barcode)).first() 
        if queryproduct:
            raise HTTPException(status_code=409, detail="This Product Already Exists")
        else:
            image_path = self.storage.upload_image(file=image_url, folder="products")
            newproduct = Product(name, description, brand, price, image_path, stock, slug, barcode, category)
            self.session.add(newproduct)
            self.session.commit()
            self.session.refresh(newproduct)
        return newproduct 

    def get_products(self, page: int, limit: int):
        query = self.session.query(Product)
        total_products = query.count()
        products = (query.order_by(Product.id_product.desc()).offset((page - 1) * limit).limit(limit).all())

        return{
            "products": products,
            "page": page,
            "limit": limit,
            "total": total_products,
            "total_pages": math.ceil(total_products / limit)
        }

    def get_product_by_name(self, name: str) -> list[Product]:
        search = f"%{name}%"
        queryproduct = self.session.query(Product).filter(Product.product_name.ilike(search)).all()
        if not queryproduct:
            raise HTTPException(status_code=404, detail="Product Not Found")
        return queryproduct

    def get_product_by_slug(self, slug: str) -> Product:
        queryproduct = self.session.query(Product).filter(Product.slug == slug).first()
        if not queryproduct:
            raise HTTPException(status_code=404, detail="Product Not Found")
        return queryproduct

    def update_product(self, product_id: int, name: str | None = None, description: str | None = None, brand: str | None = None, price: float | None = None, image_url: UploadFile | None = None, stock: int | None = None, barcode: str | None = None, category: str | None = None) -> Product:
        queryproduct = self.session.query(Product).filter(Product.id_product == product_id).first()
        if not queryproduct:
            raise HTTPException(status_code=404, detail="Product Not Found")

        old_image_path = queryproduct.image_url
        
        if name is not None:
            slug = slugify(name)
            existing_product = self.session.query(Product).filter(Product.slug == slug, Product.id_product != product_id).first()
            if existing_product:
                raise HTTPException(status_code=409, detail="Product Already Exists")
            queryproduct.product_name = name 
            queryproduct.slug = slug
        if description is not None:
            queryproduct.description = description
        if brand is not None:
            queryproduct.brand = brand
        if stock is not None:
            queryproduct.stock = stock
        if price is not None:
            queryproduct.price = price
        if image_url is not None:
            image_path = self.storage.upload_image(file=image_url, folder="products")
            queryproduct.image_url = image_path
        if barcode is not None:
            queryproduct.barcode = barcode
        if category is not None:
            queryproduct.category = category

        self.session.commit()
        self.session.refresh(queryproduct)

        if old_image_path and old_image_path.startswith("products/"):
            self.storage.delete_image(old_image_path)

        return queryproduct
    
    def delete_product(self, product_id: int):
        queryproduct = self.session.query(Product).filter(Product.id_product == product_id).first()
        if not queryproduct:
            raise HTTPException(status_code=404, detail="Product not found")
        paht = queryproduct.image_url
        self.session.query(Item_Cart).filter(Item_Cart.id_product == product_id).delete(synchronize_session=False)
        self.session.delete(queryproduct)
        self.session.commit()
        if paht and paht.startswith("products/"):
            self.storage.delete_image(paht)
        return {"message": "Produto Deletado"}