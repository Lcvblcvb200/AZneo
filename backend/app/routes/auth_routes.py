from fastapi import APIRouter, Depends
from backend.app.schemas.auth_schemas import SignUpSchema, LoginSchema, SignUpCompanySchema, TokenOut
from backend.app.core.db import getsession
from sqlalchemy.orm import Session
from backend.app.core.security import token_verify
from backend.app.services.auth_services import UserService
from backend.app.models.models import User

authrouter = APIRouter(prefix="/auth", tags=["auth"])

@authrouter.post("/signup", response_model=TokenOut)
def signup(body: SignUpSchema, session: Session = Depends(getsession)):
    user_service = UserService(session)
    signup = user_service.signup(body.name, body.email, body.password, body.cpf)
    return{
        "access_token": signup,
        "token_type": "Bearer"
    }

@authrouter.post("/signin", response_model=TokenOut)
def signin(body: LoginSchema, session: Session = Depends(getsession)):
    user_service = UserService(session)
    signin = user_service.signin(body.email, body.password)
    return{
        "access_token": signin,
        "token_type": "Bearer"
    }

@authrouter.post("/signupcompany", response_model=TokenOut)
def signup_company(body: SignUpCompanySchema, session: Session = Depends(getsession)):
    user_service = UserService(session)
    signup = user_service.signup_company(body.name_f, body.name_s, body.cnpj, body.ie, body.email, body.password)
    return{
        "access_token": signup,
        "token_type": "Bearer"
    }

@authrouter.get("/profile")
def profile(user: User = Depends(token_verify), session: Session = Depends(getsession)):
    user_search = UserService(session)
    return user_search.get_profile(user)