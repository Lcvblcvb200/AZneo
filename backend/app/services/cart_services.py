from fastapi import HTTPException
from sqlalchemy.orm import Session, joinedload
from backend.app.models.models import Cart, Item_Cart, Product

class CartServices:
    def __init__(self, session: Session):
        self.session = session

    def recalculate_total(self, id_cart: int):
        items = self.session.query(Item_Cart).filter(Item_Cart.id_cart == id_cart).all()
        total = sum(item.quantity * item.unit_price for item in items)
        cart = self.session.query(Cart).filter(Cart.id_cart == id_cart).first()
        cart.total = total

    def get_owned_item(self, id_user: int, id_item: int) -> Item_Cart:
        item = (self.session.query(Item_Cart).join(Cart, Cart.id_cart == Item_Cart.id_cart).filter(Item_Cart.id_item == id_item, Cart.id_user == id_user).first())
        if not item:
            raise HTTPException(status_code=404, detail="Item Not Found")
        return item

    def get_or_create_cart(self, id_user: int) -> Cart:
        cart = (self.session.query(Cart).options(joinedload(Cart.items).joinedload(Item_Cart.product)).filter(Cart.id_user == id_user)).first()
        if not cart:
            cart = Cart(id_user, 0)
            self.session.add(cart)
            self.session.commit()
            self.session.refresh(cart)
        return cart
    
    def add_item(self, id_user: int, id_product: int, quantity: int) -> Cart:
        product = self.session.query(Product).filter(Product.id_product == id_product).first()
        if not product:
            raise HTTPException(status_code=404, detail="Product Not Found")
        cart = self.get_or_create_cart(id_user)
        item = self.session.query(Item_Cart).filter(Item_Cart.id_cart == cart.id_cart, Item_Cart.id_product == id_product).first()

        if item:
            item.quantity += quantity
        else:
            item_added = Item_Cart(cart.id_cart, id_product, quantity, product.price)
            self.session.add(item_added)
        self.recalculate_total(cart.id_cart)
        self.session.commit()
        return self.get_or_create_cart(id_user)

    def update_item(self, id_user: int, id_item: int, quantity: int) -> Cart:
        item = self.get_owned_item(id_user, id_item)
        item.quantity = quantity
        self.recalculate_total(item.id_cart)
        self.session.commit()
        return self.get_or_create_cart(id_user)

    def delete_item(self, id_user: int, id_item: int) -> Cart:
        item = self.get_owned_item(id_user, id_item)
        self.session.delete(item)
        self.recalculate_total(item.id_cart)
        self.session.commit()
        return self.get_or_create_cart(id_user)