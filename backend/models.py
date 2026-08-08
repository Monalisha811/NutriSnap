from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from app import db

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    meals = db.relationship('Meal', backref='user', lazy=True, cascade='all, delete-orphan')

    def set_password(self, password): self.password_hash = generate_password_hash(password)
    def verify_password(self, password): return check_password_hash(self.password_hash, password)
    def public(self): return {'id': self.id, 'name': self.name, 'email': self.email}

class Meal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    foods = db.Column(db.JSON, nullable=False)
    nutrition = db.Column(db.JSON, nullable=False)
    context = db.Column(db.JSON, default=dict)
    image_url = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)

    def public(self):
        return {'id': self.id, 'foods': self.foods, 'nutrition': self.nutrition, 'context': self.context, 'imageUrl': self.image_url, 'createdAt': self.created_at.isoformat()}
