from ollama import chat

question = input("Ask IntelliMind: ")

response = chat(
    model="qwen3:4b",
    messages=[
        {
            "role": "user",
            "content": question
        }
    ]
)

print("\nIntelliMind:\n")
print(response["message"]["content"])