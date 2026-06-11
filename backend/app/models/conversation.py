from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, func
from sqlalchemy.orm import relationship
import uuid
from .database import Base

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    active_model = Column(String, nullable=False, default="llama-3.3-70b-versatile")
    is_memory_enabled = Column(Boolean, nullable=False, default=True)
    is_rag_enabled = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")
