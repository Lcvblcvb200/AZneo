from fastapi import FastAPI
from backend.app.routes.auth_routes import authrouter
from backend.app.routes.products_routes import productroute
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.include_router(productroute)
app.include_router(authrouter)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)