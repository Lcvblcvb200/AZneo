from pydantic import BaseModel, ConfigDict, Field

class AddressCreate(BaseModel):
    cep: str = Field(min_length=8, max_length=9)
    logradouro: str
    number: str
    complement: str | None = None
    neighborhood: str
    city: str
    state: str = Field(min_length=2, max_length=2)

class AddressResponse(AddressCreate):
    model_config = ConfigDict(from_attributes=True)

    id_address: int
    id_user: int
