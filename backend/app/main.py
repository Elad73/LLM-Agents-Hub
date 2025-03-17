from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .projects.router import router

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the router with a prefix
app.include_router(router, prefix="/api/projects") 