from pydantic import BaseModel

class SignUpSchema(BaseModel):
    name: str
    email: str
    password: str

class LoginSchema(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    name: str
    email: str

class TokenOut(BaseModel):
    access_token: str
    token_type: str