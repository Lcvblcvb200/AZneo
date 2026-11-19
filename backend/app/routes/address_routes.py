
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.core.db import getsession
from backend.app.core.security import token_verify
from backend.app.models.models import User
from backend.app.services.address_services import AddressService
from backend.app.schemas.address_schemas import AddressCreate, AddressResponse



addressroute = APIRouter(
    prefix="/addresses",
    tags=["Addresses"]
)


@addressroute.get(
    "",
    response_model=list[AddressResponse]
)
def get_addresses(
    session: Session = Depends(getsession),
    user: User = Depends(token_verify)
):
    service = AddressService(session)
    return service.get_addresses(user.id_user)


@addressroute.post("/create", response_model=AddressResponse)
def create_address(data: AddressCreate, session: Session = Depends(getsession), user: User = Depends(token_verify)):
    service = AddressService(session)
    return service.create_address(user.id_user, data.cep, data.logradouro, data.number, data.complement, data.neighborhood, data.city, data.state)
