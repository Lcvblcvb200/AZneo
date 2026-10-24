from datetime import datetime, timezone
from sqlalchemy import Column, String, Numeric, Integer, ForeignKey, DateTime, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB
from backend.app.db.db import Base

class User(Base):
    __tablename__ = "users"
    id_user = Column("id_user", Integer, primary_key=True, nullable=False, autoincrement=True)
    name = Column("name", String, nullable=False)
    email = Column("email", String, nullable=False, unique=True)
    password = Column("password", String, nullable=False)
    cpf = Column("cpf", String, nullable=True, unique=True)
    role = Column("role", String, nullable=False, default="customer")

    def __init__(self, name, email, password, cpf, role="customer"):
        self.name = name.strip()
        self.email = email.strip().lower()
        self.password = password
        self.cpf = cpf
        self.role = role

    company = relationship("UserCompany", back_populates="user", uselist=False)
    comments = relationship("Comments", back_populates="user")
    addresses = relationship("Address", back_populates="user")
    orders = relationship("Order", back_populates="user")

class UserCompany(Base):
    __tablename__ = "usercompany"
    id_usercompany = Column("id_usercompany", Integer, primary_key=True, nullable=False, autoincrement=True)
    id_user = Column("id_user", Integer, ForeignKey("users.id_user"), nullable=False, unique=True)
    name_f = Column("name_f", String, nullable=False)
    name_s = Column("name_s", String, nullable=False)
    cnpj = Column("cnpj", String, nullable=True, unique=True)
    ie = Column("ie", String, nullable=False)

    def __init__(self, id_user, name_f, name_s, cnpj, ie):
            self.id_user = id_user
            self.name_f = name_f
            self.name_s = name_s
            self.cnpj = cnpj
            self.ie = ie

    user = relationship("User", back_populates="company")
class Address(Base):
    __tablename__ = "addresses"
    id_address = Column("id_address", Integer, primary_key=True, nullable=False, autoincrement=True)
    id_user = Column("id_user", Integer, ForeignKey("users.id_user"), nullable=False)
    cep = Column("cep", String, nullable=False)
    logradouro = Column("logradouro", String, nullable=False)
    number = Column("number", String, nullable=False)
    complement = Column("complement", String, nullable=True)
    neighborhood = Column("neighborhood", String, nullable=False)
    city = Column("city", String, nullable=False)
    state = Column("state", String, nullable=False)

    def __init__(self, id_user, cep, logradouro, number, complement, neighborhood, city, state):
            self.id_user = id_user
            self.cep = cep
            self.logradouro = logradouro
            self.number = number
            self.complement = complement
            self.neighborhood = neighborhood
            self.city = city
            self.state = state

    user = relationship("User", back_populates="addresses")
    orders = relationship("Order", back_populates="address")

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
    barcode = Column("barcode", String, unique=True, nullable=False)
    category = Column("category", String, nullable=False)

    def __init__(self, product_name, description, brand, price, image_url, stock, slug, barcode, category):
        self.product_name = product_name
        self.description = description
        self.brand = brand
        self.price = price
        self.image_url = image_url
        self.stock = stock
        self.slug = slug
        self.barcode = barcode
        self.category = category

class Cart(Base):
    __tablename__ = "carts"
    id_cart = Column("id_cart", Integer, primary_key=True, nullable=False, autoincrement=True)
    id_user = Column("id_user", Integer, ForeignKey("users.id_user"), nullable=False)
    total = Column("total_price", Numeric(7, 2), nullable=False)

    items = relationship("Item_Cart", back_populates="cart", cascade="all, delete-orphan")

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

    cart = relationship("Cart", back_populates="items")
    product = relationship("Product")

    def __init__(self, id_cart, id_product, quantity, unit_price):
        self.id_cart = id_cart
        self.id_product = id_product
        self.quantity = quantity
        self.unit_price = unit_price

class Comments(Base):
     __tablename__ = "comments"
     id_comment = Column("id_comment", Integer, primary_key=True, autoincrement=True, nullable=False)
     id_user = Column("id_user", Integer, ForeignKey("users.id_user"), nullable=False)
     id_product = Column("id_product", Integer, ForeignKey("products.id_product"), nullable=False)
     image_url = Column("image_url", String, nullable=True)
     content = Column("content", String, nullable=False)
     rating = Column("rating", Numeric(2, 1), nullable=False)

     user = relationship("User", back_populates="comments")

     def __init__(self, id_user, id_product, image_url, content, rating):
          self.id_user = id_user
          self.id_product = id_product
          self.image_url = image_url
          self.content = content
          self.rating = rating

class Order(Base):
     __tablename__ = "orders"
     id_order = Column("id_order", Integer, primary_key=True, autoincrement=True, nullable=False)
     id_user = Column("id_user", Integer, ForeignKey("users.id_user"), nullable=False)
     id_address = Column("id_address", Integer, ForeignKey("addresses.id_address"))
     contact_name = Column("contact_name", String, nullable=False)
     contact_email = Column("contact_email", String, nullable=False)
     contact_number = Column("contact_number", String, nullable=False)
     contact_cpf = Column("contact_cpf", String, nullable=False)
     subtotal = Column("subtotal", Numeric(10, 2), nullable=False)
     total_items = Column("total_items", Integer, nullable=False)
     shipping_cost = Column("shipping_cost", Numeric(10, 2), nullable=False)
     shipping_address = Column(JSONB, nullable=False)
     created_at = Column("created_at", DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
     total_price = Column("total_price", Numeric(10, 2), nullable=False)
     coupon_code = Column("coupon_code", String, nullable=True)
     discount_amount = Column("discount_amount", Numeric(10, 2), nullable=False, default=0)
     status = Column("status", String, nullable=False, default="Pendente")

     def __init__(self, id_user, id_address, contact_name, contact_email, contact_number, contact_cpf, subtotal, total_items, shipping_cost, total_price, shipping_address, coupon_code, discount_amount=0, status="Pendente"):
               self.id_user = id_user
               self.id_address = id_address
               self.contact_name = contact_name
               self.contact_email = contact_email
               self.contact_number = contact_number
               self.contact_cpf = contact_cpf
               self.subtotal = subtotal
               self.total_items = total_items
               self.shipping_cost = shipping_cost
               self.total_price = total_price
               self.shipping_address = shipping_address
               self.coupon_code = coupon_code
               self.discount_amount = discount_amount
               self.status = status

     user = relationship("User", back_populates="orders")
     address = relationship("Address", back_populates="orders")
     items = relationship("Item_Order", back_populates="order")

class Item_Order(Base):
     __tablename__ = "item_order"
     __table_args__ = (CheckConstraint("quantity >= 1", name = "ck_item_order_priority"), CheckConstraint("unit_discount >= 0 AND unit_discount < unit_price", name="ck_item_order_discount"))
     id_order_item = Column("id_order_item", Integer, primary_key=True, autoincrement=True, nullable=False)
     id_order = Column("id_order", ForeignKey("orders.id_order"), nullable=False)
     id_product = Column("id_product", ForeignKey("products.id_product"), nullable=False)
     product_name = Column("product_name", String, nullable=False)
     quantity = Column("quantity", Integer, nullable=False)
     unit_price = Column("unit_price", Numeric(10, 2), nullable=False)
     unit_discount = Column("unit_discount", Numeric(10, 2), nullable=False)
     total_price = Column("total_price", Numeric(10, 2), nullable=False)

     def __init__(self, id_order, id_product, product_name, quantity, unit_price, unit_discount, total_price):
          self.id_order = id_order
          self.id_product = id_product
          self.product_name = product_name
          self.quantity = quantity
          self.unit_price = unit_price
          self.unit_discount = unit_discount
          self.total_price = total_price

     order = relationship("Order", back_populates="items")
     product = relationship("Product")