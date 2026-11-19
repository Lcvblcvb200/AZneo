from fastapi import HTTPException
from sqlalchemy.orm import Session, joinedload
from backend.app.models.models import Order, Item_Order, Cart, Item_Cart, Product, Address, User, UserCompany, Codes
from decimal import Decimal
from datetime import datetime, timezone
class OrderService:
    def __init__(self, session: Session):
        self.session = session

    def checkout(self, id_user: int, id_address: int, coupon_code: str | None) -> Order:
        user = self.session.query(User).filter(User.id_user == id_user).first()
        if not user:
            raise HTTPException(status_code=404, detail="User Not Found")
        cart = (self.session.query(Cart).options(joinedload(Cart.items).joinedload(Item_Cart.product)).filter(Cart.id_user == id_user).first())
        if not cart or not cart.items:
            raise HTTPException(status_code=400, detail="Cart Is Empty")

        items = sum(item.quantity for item in cart.items)

        for item in cart.items:
            if item.quantity <= 0:
                raise HTTPException(status_code=400, detail="Invalid Quantity")
            if item.product.stock < item.quantity:
                raise HTTPException(status_code=400, detail=f"Insufficient Stock: {item.product.product_name}")

        subtotal = sum(item.quantity * item.product.price for item in cart.items)

        address = self.session.query(Address).filter(Address.id_user == id_user, Address.id_address == id_address).first()
        if not address: 
            raise HTTPException(status_code=404, detail="Address Not Found")
        
        shipping_address = {"cep": address.cep, "logradouro": address.logradouro, "number": address.number, "complement": address.complement, "neighborhood": address.neighborhood, "city": address.city, "state": address.state}

        if user.role == "company":
            doc = self.session.query(UserCompany).filter(UserCompany.id_user == id_user).first()
            if not doc or not doc.cnpj:
                raise HTTPException(status_code=404, detail="Company Document Not Found")
            document = doc.cnpj
            iscompany = True
        else:
            if not user.cpf:
                raise HTTPException(status_code=404, detail="User Document Not Found")
            document = user.cpf
            iscompany = False

        if subtotal >= Decimal("200.00"):
            shipping_cost = Decimal("0.00")
        elif subtotal >= Decimal("100.00"):
            shipping_cost = Decimal("10.00")
        else:
            shipping_cost = Decimal("20.00")

        discount_amount = Decimal("0.00")
        code = None

        if coupon_code:
            code = self.session.query(Codes).filter(Codes.code == coupon_code).first()
            if not code:
                raise HTTPException(status_code=400, detail="Code Not Found")
            if not code.is_active:
                raise HTTPException(status_code=400, detail="Coupon Is Inactive")
            if code.expires_at and code.expires_at <= datetime.now(timezone.utc):
                raise HTTPException(status_code=400, detail="Code Expired")
            if code.usage_limit is not None and code.used_count >= code.usage_limit:
                raise HTTPException(status_code=400, detail="Coupon Usage Limit Reached")
            if subtotal < code.minimum_order:
                raise HTTPException(status_code=400, detail="Minimum Order Value Not Reached")  
            if code.discount_type == "percentage":
                discount_amount = subtotal * code.discount / Decimal("100")
            elif code.discount_type == "fixed":
                discount_amount = code.discount
            else:
                raise HTTPException(status_code=400, detail="Invalid Discount Type")

        id_code = code.id_code if code else None

        discount_amount = min(discount_amount, subtotal)
            
        total_price = subtotal + shipping_cost - discount_amount

        order = Order(id_user, id_address, user.name, user.email, document, iscompany, subtotal, items, shipping_cost, total_price, shipping_address, coupon_code, discount_amount, id_code=id_code)

        self.session.add(order)
        self.session.flush()

        for item in cart.items:
            product = item.product
            order_item = Item_Order(id_order=order.id_order, id_product=product.id_product, product_name=product.product_name, quantity=item.quantity, unit_price=product.price, unit_discount=Decimal("0.00"), total_price=product.price * item.quantity)
            self.session.add(order_item)

        self.session.commit()
        self.session.refresh(order)

        return order
