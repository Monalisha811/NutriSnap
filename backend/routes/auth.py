from flask import Blueprint, request
from flask_jwt_extended import create_access_token
from app import db
from models import User

auth_bp = Blueprint('auth', __name__)

@auth_bp.post('/signup')
def signup():
    data = request.get_json() or {}
    if not all(data.get(k) for k in ('name', 'email', 'password')): return {'error': 'Name, email and password are required.'}, 400
    if User.query.filter_by(email=data['email'].lower()).first(): return {'error': 'An account with this email already exists.'}, 409
    user = User(name=data['name'].strip(), email=data['email'].lower())
    user.set_password(data['password']); db.session.add(user); db.session.commit()
    return {'token': create_access_token(identity=str(user.id)), 'user': user.public()}, 201

@auth_bp.post('/login')
def login():
    data = request.get_json() or {}; user = User.query.filter_by(email=data.get('email', '').lower()).first()
    if not user or not user.verify_password(data.get('password', '')): return {'error': 'Invalid email or password.'}, 401
    return {'token': create_access_token(identity=str(user.id)), 'user': user.public()}
