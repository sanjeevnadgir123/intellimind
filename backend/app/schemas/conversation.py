from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class ConversationBase(BaseModel):
    title: str = Field(..., min_length=1)
    active_model: Optional[str] = "llama-3.3-70b-versatile"
    is_memory_enabled: Optional[bool] = True
    is_rag_enabled: Optional[bool] = True

class ConversationCreate(BaseModel):
    title: Optional[str] = "New Chat"
    active_model: Optional[str] = "llama-3.3-70b-versatile"
    is_memory_enabled: Optional[bool] = True
    is_rag_enabled: Optional[bool] = True

class ConversationUpdate(BaseModel):
    title: Optional[str] = None
    active_model: Optional[str] = None
    is_memory_enabled: Optional[bool] = None
    is_rag_enabled: Optional[bool] = None

class ConversationResponse(ConversationBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
