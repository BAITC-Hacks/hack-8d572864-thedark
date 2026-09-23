 from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)

def ask_ai(text):
    response = client.responses.create(
        model="gpt-5.6-luna",
        input=text
    )

    return response.output_text


question = input("Сұрақ енгіз: ")

answer = ask_ai(question)

print("\nИИ жауабы:")
print(answer)