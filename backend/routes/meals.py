from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app import db
from models import Meal

from services.detector import detect_food
from services.nutrition import get_nutrition
from services.adjuster import adjust_nutrition


meals_bp = Blueprint("meals", __name__)


@meals_bp.post("/analyze")
def analyze():
    image = request.files.get("image")

    if not image:
        return {
            "error": "Please upload an image."
        }, 400

    try:

        # ==========================================
        # 1. DETECT FOOD
        # ==========================================

        image_bytes = image.read()

        detection = detect_food(image_bytes)

        food_name = detection.get(
            "food_name",
            ""
        )

        confidence = detection.get(
            "confidence",
            0
        )

        # ==========================================
        # 2. GET FOOD FROM DATABASE
        # ==========================================

        nutrition = get_nutrition(food_name)

        # ==========================================
        # 3. GET USER PREPARATION DETAILS
        # ==========================================

        source = request.form.get(
            "source",
            "homemade"
        )

        portion = request.form.get(
            "portion",
            "medium"
        )

        method = request.form.get(
            "method",
            ""
        )

        oil = request.form.get(
            "oil",
            "none"
        )

        # ==========================================
        # 4. APPLY PORTION ADJUSTMENT
        # ==========================================

        adjusted_nutrition = adjust_nutrition(
            nutrition,
            source=source,
            portion=portion,
            method=method,
            oil=oil
        )

        # ==========================================
        # 5. RETURN RESULT
        # ==========================================

        return {
            "detections": [
                {
                    "name": food_name,
                    "confidence": confidence
                }
            ],

            "nutrition": adjusted_nutrition,

            "food": {
                "name": adjusted_nutrition.get(
                    "food_name",
                    food_name
                ),

                "category": adjusted_nutrition.get(
                    "category",
                    ""
                ),

                "cooking_method":
                    adjusted_nutrition.get(
                        "cooking_method",
                        ""
                    ),

                "region":
                    adjusted_nutrition.get(
                        "region",
                        ""
                    ),

                "found":
                    adjusted_nutrition.get(
                        "found",
                        False
                    )
            },

            "preparation": {
                "source": source,
                "portion": portion,
                "method": method,
                "oil": oil
            },

            "healthy_suggestion":
                adjusted_nutrition.get(
                    "healthy_suggestion",
                    ""
                )
        }

    except Exception as e:

        print(
            "Meal analysis error:",
            str(e)
        )

        return {
            "error": str(e)
        }, 500
@meals_bp.post("")
@jwt_required()
def save_meal():
    data = request.get_json() or {}

    foods = data.get("foods", [])
    nutrition = data.get("nutrition", {})
    context = data.get("context", {})

    if not foods:
        return {"error": "No food detected."}, 400

    if not nutrition:
        return {"error": "Nutrition information is missing."}, 400

    user_id = int(get_jwt_identity())

    meal = Meal(
        user_id=user_id,
        foods=foods,
        nutrition=nutrition,
        context=context
    )

    db.session.add(meal)
    db.session.commit()

    return {
        "message": "Meal saved successfully.",
        "meal": meal.public()
    }, 201
