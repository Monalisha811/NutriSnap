import io
import json
import os

from PIL import Image
from google import genai
from google.genai import types


# ==========================================
# LOAD YOUR NUTRITION DATABASE
# ==========================================

DATABASE_PATH = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "data",
    "nutrition_database.json"
)

with open(DATABASE_PATH, "r", encoding="utf-8") as f:
    FOOD_DATABASE = json.load(f)


# ==========================================
# GET FOOD NAMES FROM YOUR DATABASE
# ==========================================

FOOD_NAMES = [
    food["Food_Item"]
    for food in FOOD_DATABASE
]


# ==========================================
# GEMINI CLIENT
# ==========================================

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise RuntimeError(
        "GEMINI_API_KEY is not set in the environment."
    )

client = genai.Client(api_key=api_key)


# ==========================================
# FOOD DETECTION USING GEMINI
# ==========================================

def detect_food(image_bytes):

    # Validate image
    image = Image.open(
        io.BytesIO(image_bytes)
    ).convert("RGB")

    # Determine MIME type
    image_format = image.format

    if image_format == "PNG":
        mime_type = "image/png"
    elif image_format == "WEBP":
        mime_type = "image/webp"
    else:
        mime_type = "image/jpeg"

    # Give Gemini ONLY the food names that exist
    # in our nutrition database.
    food_list = ", ".join(FOOD_NAMES)

    prompt = f"""
You are the food recognition system for NutriSnap.

Analyze the provided food image.

Identify the single most likely food item from the following
allowed food names:

{food_list}

IMPORTANT:
- You MUST choose a food name from the allowed list.
- Do not invent a new food name.
- Return "Unknown" only if none of the allowed food names
  reasonably match the image.
- Give a confidence score between 0 and 1.
- Return ONLY valid JSON.
- Do not include markdown or explanations.

Required JSON format:

{{
    "food_name": "exact food name from the list",
    "confidence": 0.95
}}
"""

    response = client.models.generate_content(
        model="gemini-3.5-flash",
        contents=[
            prompt,
            types.Part.from_bytes(
                data=image_bytes,
                mime_type=mime_type
            )
        ]
    )

    # ==========================================
    # PARSE GEMINI RESPONSE
    # ==========================================

    response_text = response.text.strip()

    # Remove markdown code fences if Gemini adds them
    if response_text.startswith("```"):
        response_text = response_text.replace(
            "```json", ""
        ).replace(
            "```", ""
        ).strip()

    result = json.loads(response_text)

    food_name = result.get("food_name", "Unknown")
    confidence = float(
        result.get("confidence", 0)
    )

    # ==========================================
    # VERIFY FOOD EXISTS IN OUR DATABASE
    # ==========================================

    matched_food = None

    for food in FOOD_DATABASE:

        if (
            food["Food_Item"].lower().strip()
            == food_name.lower().strip()
        ):
            matched_food = food
            break

    # ==========================================
    # FOOD NOT FOUND
    # ==========================================

    if matched_food is None:

        return {
            "food_name": "Unknown",
            "confidence": 0.0
        }

    # ==========================================
    # RETURN DETECTION
    # ==========================================

    return {
        "food_name": matched_food["Food_Item"],
        "confidence": round(confidence, 3)
    }