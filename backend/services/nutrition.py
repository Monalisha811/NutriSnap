import json
import os
import re


# ==========================================
# LOAD NUTRITION DATABASE
# ==========================================

json_path = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "data",
    "nutrition_database.json"
)

with open(json_path, "r", encoding="utf-8") as f:
    FOOD_DATABASE = json.load(f)


# ==========================================
# NORMALIZE FOOD NAMES
# ==========================================

def normalize_food_name(name):
    """
    Make food names easier to compare.

    Example:
        " Pizza "       -> "pizza"
        "Coca Cola"     -> "coca cola"
        "coca-cola"     -> "coca cola"
        "Orange Juice"  -> "orange juice"
    """

    if not name:
        return ""

    name = str(name).lower().strip()

    # Replace underscores and hyphens with spaces
    name = name.replace("_", " ")
    name = name.replace("-", " ")

    # Remove extra spaces
    name = re.sub(r"\s+", " ", name)

    return name.strip()


# ==========================================
# FIND FOOD IN DATABASE
# ==========================================

def find_food(food_name):
    """
    Find a food in the NutriSnap database.

    First tries an exact match.
    Then tries a normalized match.
    """

    target = normalize_food_name(food_name)

    if not target:
        return None

    # --------------------------------------
    # Exact / normalized match
    # --------------------------------------

    for food in FOOD_DATABASE:

        database_name = normalize_food_name(
            food.get("Food_Item", "")
        )

        if database_name == target:
            return food

    # --------------------------------------
    # Simple fallback matching
    # --------------------------------------
    #
    # This helps with small differences such as:
    #
    # "Margherita Pizza" -> "pizza"
    # "Coca Cola"        -> "Coca-Cola"
    #
    # We only use this if there is no exact match.
    # --------------------------------------

    for food in FOOD_DATABASE:

        database_name = normalize_food_name(
            food.get("Food_Item", "")
        )

        if (
            target in database_name
            or database_name in target
        ):
            return food

    return None


# ==========================================
# GET NUTRITION
# ==========================================

def get_nutrition(food_name):

    food = find_food(food_name)

    # --------------------------------------
    # FOOD NOT FOUND
    # --------------------------------------

    if food is None:
        return {
            "food_name": food_name,
            "found": False,
            "category": "",
            "cooking_method": "",
            "region": "",
            "spice_level": "",
            "calories": None,
            "protein": None,
            "fat": None,
            "carbohydrates": None,
            "fiber": None,
            "sugar": None,
            "sodium": None,
            "potassium": None,
            "vitamin_c": None,
            "calcium": None,
            "iron": None,
            "healthy_suggestion": (
                "Nutrition information is not available "
                "for this food."
            ),
        }

    # --------------------------------------
    # FOOD FOUND
    # --------------------------------------

    return {
        "food_name": food.get("Food_Item", food_name),

        "found": True,

        "category": food.get("Category", ""),

        "cooking_method": food.get(
            "Cooking_Method",
            ""
        ),

        "region": food.get(
            "Region",
            ""
        ),

        "spice_level": food.get(
            "Spice_Level",
            ""
        ),

        "calories": food.get(
            "Calories_per_100g",
            0
        ),

        "protein": food.get(
            "Protein_g",
            0
        ),

        "fat": food.get(
            "Fat_g",
            0
        ),

        "carbohydrates": food.get(
            "Carbs_g",
            0
        ),

        "fiber": food.get(
            "Fiber_g",
            0
        ),

        "sugar": food.get(
            "Sugar_g",
            0
        ),

        "sodium": food.get(
            "Sodium_mg",
            0
        ),

        "potassium": food.get(
            "Potassium_mg",
            0
        ),

        "vitamin_c": food.get(
            "Vitamin_C_mg",
            0
        ),

        "calcium": food.get(
            "Calcium_mg",
            0
        ),

        "iron": food.get(
            "Iron_mg",
            0
        ),

        "healthy_suggestion": (
            "Eat a balanced diet and stay hydrated."
        ),
    }


# ==========================================
# TEST HELPER
# ==========================================

def database_status():
    """
    Useful for checking whether the database
    loaded correctly.
    """

    return {
        "food_count": len(FOOD_DATABASE),
        "database_loaded": True,
    }