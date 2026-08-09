import io
import json
import os

from PIL import Image
from transformers import pipeline


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
# LOAD ZERO-SHOT MODEL
# ==========================================

classifier = None


def get_classifier():
    global classifier

    if classifier is None:
        classifier = pipeline(
            "zero-shot-image-classification",
            model="openai/clip-vit-base-patch32"
        )

    return classifier

# ==========================================
# FOOD DETECTION
# ==========================================

def detect_food(image_bytes):

    image = Image.open(
        io.BytesIO(image_bytes)
    ).convert("RGB")

    # Give CLIP the food names from OUR database
    predictions = get_classifier()(
        image,
        candidate_labels=FOOD_NAMES
    )

    best = predictions[0]

    food_name = best["label"]
    confidence = float(best["score"])

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

    if matched_food is None:

        return {
            "food_name": "Unknown",
            "confidence": 0.0
        }

    return {
        "food_name": matched_food["Food_Item"],
        "confidence": round(confidence, 3)
    }