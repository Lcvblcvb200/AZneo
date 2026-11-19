
from fastapi import HTTPException
from sqlalchemy.orm import Session
from backend.app.models.models import Address
from backend.app.schemas.address_schemas import AddressCreate


class AddressService:
    def __init__(self, session: Session):
        self.session = session

    def get_addresses(self, id_user: int):
        return (
            self.session.query(Address)
            .filter(Address.id_user == id_user)
            .order_by(Address.id_address.desc())
            .all()
            )

    def create_address(self, id_user: int, cep: str, logradouro: str, number: str, complement: str, neighborhood: str, city: str, state: str):
        address = Address(id_user, cep, logradouro, number, complement, neighborhood, city, state.upper())

        self.session.add(address)
        self.session.commit()
        self.session.refresh(address)

        return address