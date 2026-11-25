from datetime import datetime, timedelta, timezone
from decimal import Decimal
from sqlalchemy import func
from sqlalchemy.orm import Session
from backend.app.models.models import User, Product, Order, Item_Order

class DashboardService:
    def __init__(self, session: Session):
        self.session = session

    def get_dashboard(self, period: str = "30d"):
        now = datetime.now(timezone.utc)

        periods = {
            "7d": timedelta(days=7),
            "30d": timedelta(days=30),
            "90d": timedelta(days=90),
            "12m": timedelta(days=365),
            "all": None,
            }

        if period not in periods:
            period = "30d"

        start_date = (
            now - periods[period]
            if periods[period]
            else None
        )

        order_query = self.session.query(Order)

        if start_date:
            order_query = order_query.filter(
                Order.created_at >= start_date
            )

        valid_orders = order_query.filter(
            func.lower(Order.status).notin_(
                ["cancelado", "cancelada", "cancelled", "canceled"]
            )
        )

        total_orders = order_query.count()
        valid_order_count = valid_orders.count()

        total_revenue = (
            valid_orders.with_entities(
                func.coalesce(func.sum(Order.total_price), 0)
            ).scalar()
        )

        average_ticket = (
            total_revenue / valid_order_count
            if valid_order_count > 0
            else Decimal("0.00")
        )

        pending_orders = order_query.filter(
            func.lower(Order.status).in_(
                ["pendente", "pending"]
            )
        ).count()

        cancelled_orders = order_query.filter(
            func.lower(Order.status).in_(
                ["cancelado", "cancelada", "cancelled", "canceled"]
            )
        ).count()

        completed_orders = order_query.filter(
            func.lower(Order.status).in_(
                ["entregue", "concluído", "concluido", "completed"]
            )
        ).count()

        total_customers = self.session.query(User).filter(
            User.role == "customer"
        ).count()

        total_products = self.session.query(Product).filter(
            Product.is_active.is_(True)
        ).count()

        low_stock_products = self.session.query(Product).filter(
            Product.is_active.is_(True),
            Product.stock > 0,
            Product.stock <= 5,
        ).count()

        out_of_stock_products = self.session.query(Product).filter(
            Product.is_active.is_(True),
            Product.stock <= 0,
        ).count()

        monthly_query = (
            self.session.query(
                func.date_trunc("month", Order.created_at).label("month"),
                func.coalesce(func.sum(Order.total_price), 0).label("revenue"),
                func.count(Order.id_order).label("orders"),
            )
            .filter(
                func.lower(Order.status).notin_(
                    ["cancelado", "cancelada", "cancelled", "canceled"]
                )
            )
        )

        if start_date:
            monthly_query = monthly_query.filter(
                Order.created_at >= start_date
            )

        monthly_sales = (
            monthly_query
            .group_by(func.date_trunc("month", Order.created_at))
            .order_by(func.date_trunc("month", Order.created_at))
            .all()
        )

        sales_chart = [
            {
                "month": row.month.strftime("%Y-%m"),
                "revenue": float(row.revenue or 0),
                "orders": row.orders,
            }
            for row in monthly_sales
        ]

        status_query = (
            order_query.with_entities(
                Order.status,
                func.count(Order.id_order).label("quantity"),
            )
            .group_by(Order.status)
            .all()
        )

        order_status = [
            {
                "status": status or "Sem status",
                "quantity": quantity,
            }
            for status, quantity in status_query
        ]

        top_products_query = (
            self.session.query(
                Item_Order.product_name,
                func.sum(Item_Order.quantity).label("quantity"),
                func.sum(Item_Order.total_price).label("revenue"),
            )
            .join(Order, Order.id_order == Item_Order.id_order)
            .filter(
                func.lower(Order.status).notin_(
                    ["cancelado", "cancelada", "cancelled", "canceled"]
                )
            )
        )

        if start_date:
            top_products_query = top_products_query.filter(
                Order.created_at >= start_date
            )

        top_products = (
            top_products_query
            .group_by(Item_Order.product_name)
            .order_by(func.sum(Item_Order.quantity).desc())
            .limit(5)
            .all()
        )

        best_sellers = [
            {
                "product_name": row.product_name,
                "quantity": int(row.quantity or 0),
                "revenue": float(row.revenue or 0),
            }
            for row in top_products
        ]

        recent_orders = (
            order_query
            .order_by(Order.created_at.desc())
            .limit(10)
            .all()
        )

        recent_orders_data = [
            {
                "id_order": order.id_order,
                "contact_name": order.contact_name,
                "contact_email": order.contact_email,
                "total_price": float(order.total_price or 0),
                "total_items": order.total_items,
                "status": order.status,
                "created_at": (
                    order.created_at.isoformat()
                    if order.created_at
                    else None
                ),
            }
            for order in recent_orders
        ]

        report_orders = (
            order_query
            .order_by(Order.created_at.desc())
            .all()
        )

        report_data = [
            {
                "id_order": order.id_order,
                "customer": order.contact_name,
                "email": order.contact_email,
                "date": (
                    order.created_at.isoformat()
                    if order.created_at
                    else ""
                ),
                "subtotal": float(order.subtotal or 0),
                "shipping": float(order.shipping_cost or 0),
                "discount": float(order.discount_amount or 0),
                "total": float(order.total_price or 0),
                "items": order.total_items,
                "status": order.status,
            }
            for order in report_orders
        ]

        return {
            "period": period,
            "summary": {
                "total_revenue": float(total_revenue or 0),
                "total_orders": total_orders,
                "average_ticket": float(average_ticket or 0),
                "total_customers": total_customers,
                "total_products": total_products,
                "low_stock_products": low_stock_products,
                "out_of_stock_products": out_of_stock_products,
                "pending_orders": pending_orders,
                "completed_orders": completed_orders,
                "cancelled_orders": cancelled_orders,
            },
            "sales_chart": sales_chart,
            "order_status": order_status,
            "best_sellers": best_sellers,
            "recent_orders": recent_orders_data,
            "report_orders": report_data,
        }