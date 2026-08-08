import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("GEMINI_API_KEY not found.")
    exit()

client = genai.Client(api_key=api_key)

print("Available models:\n")

for model in client.models.list():
    print(model.name)