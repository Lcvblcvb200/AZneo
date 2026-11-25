from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.app.core.db import getsession
from backend.app.core.security import is_admin
from backend.app.models.models import User
from backend.app.services.dashboard_service import DashboardService

dashboardroute = APIRouter(
    prefix="/admin/dashboard",
    tags=["Admin Dashboard"],
)


@dashboardroute.get("")
def get_dashboard(
    period: str = Query(
        default="30d",
        pattern="^(7d|30d|90d|12m|all)$",
    ),
    session: Session = Depends(getsession),
    admin: User = Depends(is_admin),
):
    service = DashboardService(session)
    return service.get_dashboard(period)