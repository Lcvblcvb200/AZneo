from fastapi import FastAPI
from backend.app.routes.auth_routes import authrouter
from backend.app.routes.products_routes import productroute
from backend.app.routes.cart_routes import cartroute
from backend.app.routes.comment_routes import commentroute
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

app = FastAPI()

os.makedirs("static/products", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(productroute)
app.include_router(authrouter)
app.include_router(cartroute)
app.include_router(commentroute)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)