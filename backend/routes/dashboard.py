from datetime import datetime
from flask import Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Meal

dashboard_bp = Blueprint('dashboard', __name__)


@dashboard_bp.get('')
@jwt_required()
def dashboard():

    start = datetime.utcnow().replace(
        hour=0,
        minute=0,
        second=0,
        microsecond=0
    )

    meals = Meal.query.filter(
        Meal.user_id == int(get_jwt_identity()),
        Meal.created_at >= start
    ).all()

    totals = {
        'calories': round(
            sum(m.nutrition.get('calories', 0) for m in meals), 1
        ),

        'protein': round(
            sum(m.nutrition.get('protein', 0) for m in meals), 1
        ),

        'carbs': round(
            sum(
                m.nutrition.get(
                    'carbs',
                    m.nutrition.get('carbohydrates', 0)
                )
                for m in meals
            ), 1
        ),

        'fat': round(
            sum(m.nutrition.get('fat', 0) for m in meals), 1
        ),

        'fiber': round(
            sum(m.nutrition.get('fiber', 0) for m in meals), 1
        ),
    }

    return {
        'totals': totals,
        'goal': {
            'calories': 2000,
            'protein': 90,
            'water': 8
        },
        'mealCount': len(meals),
        'weekly': []
    }