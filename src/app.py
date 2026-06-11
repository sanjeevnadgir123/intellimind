from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from groq import Groq
from dotenv import load_dotenv
import os

# Load environment variables (.env contains GROQ_API_KEY)
load_dotenv()

app = FastAPI(title="IntelliMind Backend API")

# Enable CORS for frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows communication from standard frontend Vite ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Groq client
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

class MessageModel(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[MessageModel]
    model: str
    temperature: Optional[float] = 0.3

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        # Convert request messages to Groq API format
        api_messages = [{"role": msg.role, "content": msg.content} for msg in request.messages]
        
        # Call Groq API
        response = client.chat.completions.create(
            model=request.model,
            messages=api_messages,
            temperature=request.temperature
        )
        
        answer = response.choices[0].message.content
        return {"content": answer}
        
    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
