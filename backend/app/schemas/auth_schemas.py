from pydantic import BaseModel, ConfigDict

class SignUpSchema(BaseModel):
    name: str
    email: str
    password: str
    cpf: str

    model_config = ConfigDict(from_attributes=True)

class SignUpCompanySchema(BaseModel):
    email: str
    name_f: str
    name_s: str
    cnpj: str
    ie: str
    password: str

    model_config = ConfigDict(from_attributes=True)
class LoginSchema(BaseModel):
    email: str
    password: str

    model_config = ConfigDict(from_attributes=True)

class UserOut(BaseModel):
    id_user: int
    name: str
    email: str
    role: str

    model_config = ConfigDict(from_attributes=True)
class TokenOut(BaseModel):
    access_token: str
    token_type: str

    model_config = ConfigDict(from_attributes=True)