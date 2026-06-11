from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from pydantic import BaseModel
from ..database.session import get_db
from ..models.conversation import Conversation
from ..models.message import Message
from ..schemas.conversation import ConversationCreate, ConversationResponse, ConversationUpdate
from ..schemas.message import MessageResponse, ChatMessageSend
from ..auth.jwt_handler import get_current_user
from ..models.user import User
from ..services.chat_service import chat_service

router = APIRouter(tags=["chat"])

# Request model for sending chat messages
class ChatRequest(BaseModel):
    conversation_id: str
    content: str
    model: Optional[str] = "llama-3.3-70b-versatile"
    temperature: Optional[float] = 0.3
    rag_references: Optional[List[str]] = None

@router.post("/api/chat/create", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
@router.post("/api/conversations", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
def create_conversation(
    conv_data: ConversationCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new chat conversation for the authenticated user."""
    # Ensure title is set
    title = conv_data.title or "New Chat"
    
    new_conv = Conversation(
        user_id=current_user.id,
        title=title,
        active_model=conv_data.active_model,
        is_memory_enabled=conv_data.is_memory_enabled,
        is_rag_enabled=conv_data.is_rag_enabled
    )
    db.add(new_conv)
    db.commit()
    db.refresh(new_conv)
    return new_conv

@router.get("/api/conversations", response_model=List[ConversationResponse])
def list_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve all conversations for the authenticated user, ordered by last activity."""
    return db.query(Conversation).filter(
        Conversation.user_id == current_user.id
    ).order_by(Conversation.updated_at.desc()).all()

@router.get("/api/conversations/{conversation_id}/messages", response_model=List[MessageResponse])
def get_messages(
    conversation_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve all messages in a conversation, verifying ownership."""
    # Verify ownership
    conv = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id
    ).first()
    if not conv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found or access denied."
        )
        
    return db.query(Message).filter(
        Message.conversation_id == conversation_id
    ).order_by(Message.created_at.asc()).all()

@router.put("/api/conversations/{conversation_id}", response_model=ConversationResponse)
def update_conversation(
    conversation_id: str,
    conv_update: ConversationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update conversation properties (such as title, active model, memory/RAG states)."""
    conv = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id
    ).first()
    if not conv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found or access denied."
        )
        
    # Apply updates
    if conv_update.title is not None:
        conv.title = conv_update.title
    if conv_update.active_model is not None:
        conv.active_model = conv_update.active_model
    if conv_update.is_memory_enabled is not None:
        conv.is_memory_enabled = conv_update.is_memory_enabled
    if conv_update.is_rag_enabled is not None:
        conv.is_rag_enabled = conv_update.is_rag_enabled
        
    db.commit()
    db.refresh(conv)
    return conv

@router.delete("/api/conversations/{conversation_id}")
def delete_conversation(
    conversation_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a conversation and all cascading messages."""
    conv = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id
    ).first()
    if not conv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found or access denied."
        )
        
    db.delete(conv)
    db.commit()
    return {"detail": "Conversation deleted successfully."}

@router.post("/api/chat")
def handle_chat(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Send message to a conversation, run Groq LLM completion, and save both to the database."""
    # Find conversation
    conv = db.query(Conversation).filter(
        Conversation.id == payload.conversation_id,
        Conversation.user_id == current_user.id
    ).first()
    if not conv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found or access denied."
        )

    # Save user message to database
    user_msg = Message(
        conversation_id=conv.id,
        role="user",
        content=payload.content,
        rag_references=payload.rag_references
    )
    db.add(user_msg)
    
    # Update conversation details
    conv.active_model = payload.model
    db.commit()
    db.refresh(conv)

    # Construct conversation history for Groq
    groq_messages = []
    
    # Prepend system prompt
    groq_messages.append({
        "role": "system",
        "content": (
            "You are IntelliMind, a helpful AI assistant. "
            "Always remember and use previous conversation context "
            "when answering follow-up questions."
        )
    })
    
    # If memory is enabled, fetch previous messages
    if conv.is_memory_enabled:
        # Fetch prior messages in ascending order
        past_msgs = db.query(Message).filter(
            Message.conversation_id == conv.id
        ).order_by(Message.created_at.asc()).all()
        
        for msg in past_msgs:
            groq_messages.append({
                "role": msg.role,
                "content": msg.content
            })
    else:
        # If memory is disabled, just send the current user message
        groq_messages.append({
            "role": "user",
            "content": payload.content
        })

    # Call Groq API
    try:
        response_text = chat_service.generate_response(
            model=payload.model,
            messages=groq_messages,
            temperature=payload.temperature
        )
    except Exception as e:
        # If Groq fails, we still have saved the user message.
        # Return HTTP error
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to fetch response from Groq API: {str(e)}"
        )

    # Determine reasoning steps (mocked for DeepSeek model styles, or custom)
    reasoning_steps = None
    if "deepseek" in payload.model.lower():
        reasoning_steps = [
            "Analyzing prompt context on the FastAPI database backend...",
            "Querying LLM reasoning path from Groq service...",
            "Formatting response with reasoning details..."
        ]

    # Save assistant response to database
    assistant_msg = Message(
        conversation_id=conv.id,
        role="assistant",
        content=response_text,
        reasoning_steps=reasoning_steps
    )
    db.add(assistant_msg)
    
    # Set the updated_at timestamp of the conversation
    conv.updated_at = func.now()
    db.commit()
    db.refresh(conv)

    return {
        "content": response_text,
        "user_message": MessageResponse.model_validate(user_msg),
        "assistant_message": MessageResponse.model_validate(assistant_msg)
    }
