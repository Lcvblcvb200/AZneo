from sqlalchemy import Column, String, Numeric, Integer, ForeignKey
from app.db.db import Base

class User(Base):
    __tablename__ = "users"
    id_user = Column("id_user", Integer, primary_key=True, nullable=False, autoincrement=True)
    name = Column("name", String, nullable=False)
    email = Column("email", String, nullable=False, unique=True)
    password = Column("password", String, nullable=False)
    cpf = Column("cpf", String, nullable=True, unique=True)
    rg = Column("rg", String, nullable=False, unique=True)
    role = Column("role", String, nullable=False, default="customer")

    def __init__(self, name, email, password, cpf, rg, role="customer"):
        self.name = name
        self.email = email
        self.password = password
        self.cpf = cpf
        self.rg = rg
        self.role = role

class Product(Base):
    __tablename__ = "products"
    id_product = Column("id_product", Integer, primary_key=True, nullable=False, autoincrement=True)
    product_name = Column("product_name", String, nullable=False)
    description = Column("description", String, nullable=False)
    brand = Column("brand", String, nullable=False)
    price = Column("price", Numeric(7, 2), nullable=False)
    image_url = Column("image_url", String, nullable=True)
    stock = Column("stock", Integer, nullable=False)
    slug = Column("slug", String, nullable=False, unique=True)

    def __init__(self, product_name, description, brand, price, image_url, stock, slug):
        self.product_name = product_name
        self.description = description
        self.brand = brand
        self.price = price
        self.image_url = image_url
        self.stock = stock
        self.slug = slug

class Cart(Base):
    __tablename__ = "carts"
    id_cart = Column("id_cart", Integer, primary_key=True, nullable=False, autoincrement=True)
    id_user = Column("id_user", Integer, ForeignKey("users.id_user"), nullable=False)
    total = Column("total_price", Numeric(7, 2), nullable=False)

    def __init__(self, id_user, total):
        self.id_user = id_user
        self.total = total
    

class Item_Cart(Base):
    __tablename__ = "item_cart"
    id_item = Column("id_item", Integer, primary_key=True, autoincrement=True, nullable=False)
    id_cart = Column("id_cart", Integer, ForeignKey("carts.id_cart"))
    id_product = Column("id_product", Integer, ForeignKey("products.id_product"))
    quantity = Column("quantity", Integer, nullable=False, default=1)
    unit_price = Column("unit_price", Numeric(7,2), nullable=False)

    def __init__(self, id_cart, id_product, quantity, unit_price):
        self.id_cart = id_cart
        self.id_product = id_product
        self.quantity = quantity
        self.unit_price = unit_price