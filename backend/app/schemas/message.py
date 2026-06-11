from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional

class MessageBase(BaseModel):
    role: str # 'user', 'assistant', 'system'
    content: str

class MessageCreate(MessageBase):
    reasoning_steps: Optional[List[str]] = None
    rag_references: Optional[List[str]] = None

class MessageResponse(MessageBase):
    id: str
    conversation_id: str
    reasoning_steps: Optional[List[str]] = None
    rag_references: Optional[List[str]] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ChatMessageSend(BaseModel):
    content: str = Field(..., min_length=1)
    active_model: Optional[str] = "llama-3.3-70b-versatile"
    temperature: Optional[float] = 0.3
    # Optional files references for RAG (if any)
    rag_references: Optional[List[str]] = None
