from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sys
import os
from dotenv import load_dotenv

# Ensure the src directory is in sys.path to allow imports from database and other src modules
src_path = os.path.abspath(os.path.dirname(__file__))
if src_path not in sys.path:
    sys.path.insert(0, src_path)

# Add Services directory to sys.path to allow imports from Authentication and UserManagement
services_path = os.path.join(src_path, "Services")
if services_path not in sys.path:
    sys.path.insert(0, services_path)

from database.database import test_supabase_connection, get_supabase

# Load .env for backwards compatibility
load_dotenv()

# Attempt to import centralized config if available; fall back to environment variables
try:
    from config import ALLOWED_ORIGINS as CONFIG_ALLOWED_ORIGINS, PORT as CONFIG_PORT
except Exception:
    CONFIG_ALLOWED_ORIGINS = None
    CONFIG_PORT = None

app = FastAPI(
    title="Viveris Carbone API",
    description="FastAPI backend for Viveris Carbone project",
    version="1.0.0"
)

# CORS configuration
if CONFIG_ALLOWED_ORIGINS is not None:
    origins = CONFIG_ALLOWED_ORIGINS
else:
    origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
from Authentication.Routes.authRoutes import router as auth_router
from UserManagement.Routes.userRoutes import router as user_router
from Emissions.Routes.emissionsRoutes import router as emissions_router
from Gamification.Routes.gamificationRoutes import router as gamification_router
from Community.Routes.communityRoutes import router as community_router
from Community.Routes.friendsRoutes import router as friends_router

app.include_router(auth_router)
app.include_router(user_router, tags=["users"])
app.include_router(emissions_router)
app.include_router(gamification_router)
app.include_router(community_router)
app.include_router(friends_router)



@app.on_event("startup")
async def startup_event():
    print("🚀 Starting FastAPI...")
    test_supabase_connection()


class HealthResponse(BaseModel):
    status: str
    message: str


class MessageResponse(BaseModel):
    message: str


@app.get("/", response_model=HealthResponse)
async def root():
    """Root endpoint"""
    return {
        "status": "ok",
        "message": "Viveris Carbone API is running"
    }


@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "message": "Backend is operational"
    }


@app.get("/api/hello", response_model=MessageResponse)
async def hello_world():
    """Hello world endpoint"""
    return {"message": "Hello from FastAPI backend!"}


@app.get("/")
async def test_api():
    return {"message": "BestBy API is running 🚀"}


if __name__ == "__main__":
    import uvicorn
    port = int(CONFIG_PORT or os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
