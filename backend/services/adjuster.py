def adjust_nutrition(
    nutrition,
    source="homemade",
    portion="medium",
    method="boiled",
    oil="none"
):
    """
    Adjust nutrition based on portion size.

    Safely handles missing/None nutrition values.
    """

    nutrition = nutrition.copy()

    # ==========================================
    # PORTION MULTIPLIERS
    # ==========================================

    portion_multiplier = {
        "small": 0.75,
        "medium": 1.0,
        "large": 1.5
    }

    multiplier = portion_multiplier.get(
        str(portion).lower(),
        1.0
    )

    # ==========================================
    # NUTRITION FIELDS
    # ==========================================

    nutrition_fields = [
        "calories",
        "protein",
        "fat",
        "carbohydrates",
        "fiber",
        "sugar",
        "sodium",
        "potassium",
        "vitamin_c",
        "calcium",
        "iron"
    ]

    # ==========================================
    # APPLY PORTION ADJUSTMENT
    # ==========================================

    for key in nutrition_fields:

        value = nutrition.get(key)

        # Skip fields that don't have a value
        if value is None:
            continue

        try:
            nutrition[key] = round(
                float(value) * multiplier,
                2
            )

        except (TypeError, ValueError):
            # Leave invalid values unchanged
            continue

    # ==========================================
    # STORE USER SELECTIONS
    # ==========================================

    nutrition["portion"] = portion
    nutrition["source"] = source
    nutrition["method"] = method
    nutrition["oil"] = oil

    return nutrition