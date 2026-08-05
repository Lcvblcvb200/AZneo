from fastapi import FastAPI
from app.routes.auth_routes import authrouter
from app.routes.products_routes import productroute

app = FastAPI()

app.include_router(productroute)
app.include_router(authrouter)