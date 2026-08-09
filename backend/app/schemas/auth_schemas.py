from pydantic import BaseModel

class SignUpSchema(BaseModel):
    name: str
    email: str
    password: str
    cpf: str
    rg: str

class LoginSchema(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    name: str
    email: str
    role: str

class TokenOut(BaseModel):
    access_token: str
    token_type: str