from groq import Groq
from dotenv import load_dotenv
import os
import json

# Load environment variables
load_dotenv()

# Initialize Groq client
client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

# Conversation memory (initialized once outside the loop)
messages = [
    {
        "role": "system",
        "content": (
            "You are IntelliMind, a helpful AI assistant. "
            "Always remember and use previous conversation context "
            "when answering follow-up questions."
        )
    }
]

print("=" * 50)
print("Welcome to IntelliMind")
print("Type 'exit' to quit")
print("=" * 50)

while True:
    question = input("\nYou: ")

    if question.lower() == "exit":
        print("\nGoodbye!")
        break

    # Store user message
    messages.append(
        {
            "role": "user",
            "content": question
        }
    )

    # DEBUG: Print the entire messages payload before the API call to verify history and structure
    print("\n" + "="*80)
    print("DEBUG: MESSAGES PAYLOAD BEING SENT TO GROQ API")
    print("="*80)
    print(json.dumps(messages, indent=2))
    print("="*80 + "\n")

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.3
        )

        answer = response.choices[0].message.content

        print("\nIntelliMind:")
        print(answer)

        # Store assistant response
        messages.append(
            {
                "role": "assistant",
                "content": answer
            }
        )

        # DEBUG: Verify the current conversation history length and that messages aren't reset
        print("\n" + "-"*80)
        print(f"DEBUG: Current conversation history contains {len(messages)} messages (including system).")
        print("-"*80 + "\n")

    except Exception as e:
        print(f"\nError: {e}")
