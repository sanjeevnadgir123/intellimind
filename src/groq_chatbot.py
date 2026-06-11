from groq import Groq

client = Groq(
    api_key="YORE API KEY"
)

while True:
    question = input("You: ")

    if question.lower() == "exit":
        break

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "user",
                "content": question
            }
        ]
    )

    print("\nIntelliMind:")
    print(response.choices[0].message.content)
    print()