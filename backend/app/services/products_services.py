from fastapi import HTTPException
from sqlalchemy.orm import Session
from slugify import slugify
from backend.app.models.models import Product

class ProductService:
    def __init__(self, session: Session):
        self.session = session

    def create_product(self, name: str, description: str, brand: str, price: float, image_url: str, stock: int) -> Product:
        slug = slugify(name)
        queryproduct = self.session.query(Product).filter(Product.slug == slug).first() 
        if queryproduct:
            raise HTTPException(status_code=409, detail="This Product Already Exists")
        else:
            newproduct = Product(name, description, brand, price, image_url, stock, slug)
            self.session.add(newproduct)
            self.session.commit()
            self.session.refresh(newproduct)
        return newproduct
        
    def get_products(self) ->list[Product]:
        queryproducts = self.session.query(Product).all()
        return queryproducts

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

    def update_product(self, product_id: int, name: str | None = None, description: str | None = None, brand: str | None = None, price: int | None = None, image_url: float | None = None, stock: str | None = None) -> Product:
        queryproduct = self.session.query(Product).filter(Product.id_product == product_id).first()
        if not queryproduct:
            raise HTTPException(status_code=404, detail="Product Not Found")
        
        if name is not None:
            slug = slugify(name)
            existing_product = self.session.query(Product).filter(Product.slug == slug, Product.id_product != product_id).first()
            if existing_product:
                raise HTTPException(status_code=409, detail="Product Already Exists")
            queryproduct.name = name 
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
            queryproduct.image_url = image_url

        self.session.commit()
        self.session.refresh(queryproduct)
        return queryproduct
    
    def delete_product(self, product_id: int):
        queryproduct = self.session.query(Product).filter(Product.id_product == product_id).first()
        if not queryproduct:
            raise HTTPException(status_code=404, detail="Product not found")
        self.session.delete(queryproduct)
        self.session.commit()
        return {"message": "Produto Deletado"}