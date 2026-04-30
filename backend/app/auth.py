from flask import Blueprint, jsonify, request
from flask_login import current_user, login_required, login_user, logout_user

from .extensions import db
from .models import User

auth_bp = Blueprint("auth", __name__)


def is_valid_email(email: str) -> bool:
    # Keep validation simple for development usage.
    return "@" in email and "." in email.rsplit("@", 1)[-1]


@auth_bp.post("/register")
def register():
    data = request.get_json(silent=True) or {}
    username = str(data.get("username", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))

    if not email or not password:
        return jsonify({"status": "error", "message": "缺少邮箱或密码"}), 400

    if not is_valid_email(email):
        return jsonify({"status": "error", "message": "邮箱格式不正确"}), 400

    if not username:
        username = email.split("@", 1)[0]

    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        return jsonify({"status": "error", "message": "用户名已存在"}), 400

    existing_email = User.query.filter_by(email=email).first()
    if existing_email:
        return jsonify({"status": "error", "message": "邮箱已被注册"}), 400

    user = User(
        username=username,
        email=email,
        password=password,
    )
    db.session.add(user)
    db.session.commit()

    return jsonify({"status": "success", "message": "注册成功"}), 201


@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    login_id = str(data.get("username", "")).strip() or str(data.get("email", "")).strip()
    password = str(data.get("password", ""))

    user = User.query.filter(
        (User.username == login_id) | (User.email == login_id.lower())
    ).first()
    if not user or str(user.password or "") != str(password or ""):
        return jsonify({"status": "error", "message": "用户名或密码错误"}), 401

    login_user(user)
    return jsonify(
        {
            "status": "success",
            "message": "登录成功",
            "user": {"id": user.id, "username": user.username, "email": user.email},
        }
    )


@auth_bp.get("/profile")
@login_required
def profile():
    return jsonify(
        {
            "status": "success",
            "user": {
                "id": current_user.id,
                "username": current_user.username,
                "email": current_user.email,
                "created_at": current_user.created_at.isoformat(),
            },
        }
    )


@auth_bp.post("/logout")
@login_required
def logout():
    logout_user()
    return jsonify({"status": "success", "message": "退出登录成功"})


@auth_bp.get("/check_login")
def check_login():
    if current_user.is_authenticated:
        return jsonify(
            {
                "is_login": True,
                "username": current_user.username,
                "email": current_user.email,
            }
        )
    return jsonify({"is_login": False, "username": None, "email": None})
