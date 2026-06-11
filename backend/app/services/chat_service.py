from groq import Groq
import os
from typing import List, Dict, Any
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class ChatService:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        if not self.api_key:
            raise ValueError("GROQ_API_KEY is not set in environment variables.")
        self.client = Groq(api_key=self.api_key)

    def generate_response(
        self, 
        model: str, 
        messages: List[Dict[str, str]], 
        temperature: float = 0.3
    ) -> str:
        """Call the Groq API to generate a chat completion response."""
        try:
            response = self.client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=temperature
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"Error calling Groq API: {e}")
            raise e

# Instantiate a single service instance
chat_service = ChatService()
