from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database.session import engine
from .models.database import Base
# Import all models to ensure they are registered with Base metadata
from .models.user import User
from .models.conversation import Conversation
from .models.message import Message
from .routes import auth_router, chat_router

# Create database tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(title="IntelliMind Backend API", version="2.0.0")

# Enable CORS for frontend Vite development server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows communication from standard frontend Vite ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(chat_router)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Welcome to the IntelliMind Backend API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
