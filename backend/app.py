import os
from datetime import timedelta
from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy

load_dotenv()
db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config.update(
        SECRET_KEY=os.getenv('SECRET_KEY', 'nutrisnap-development-secret'),
        SQLALCHEMY_DATABASE_URI=os.getenv('DATABASE_URL', 'sqlite:///nutrisnap.db'),
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        JWT_SECRET_KEY=os.getenv('JWT_SECRET_KEY', 'nutrisnap-jwt-secret'),
        JWT_ACCESS_TOKEN_EXPIRES=timedelta(days=7),
        MAX_CONTENT_LENGTH=10 * 1024 * 1024,
    )
    CORS(app, resources={r'/api/*': {'origins': '*'}})
    db.init_app(app)
    JWTManager(app)

    from routes.auth import auth_bp
    from routes.meals import meals_bp
    from routes.dashboard import dashboard_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(meals_bp, url_prefix='/api/meals')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')

    with app.app_context():
        from models import User, Meal
        db.create_all()

    @app.get('/api/health')
    def health():
        return {'status': 'ok', 'service': 'NutriSnap API'}

    return app
if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
