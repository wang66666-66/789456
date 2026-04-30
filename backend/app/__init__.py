from flask import Flask, jsonify
from flask_cors import CORS

from .auth import auth_bp
from .config import Config
from .extensions import db, login_manager
from .models import User


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    CORS(
        app,
        supports_credentials=True,
        resources={
            r"/api/*": {
                "origins": [
                    r"http://localhost:\d+",
                    r"http://127\.0\.0\.1:\d+",
                ]
            }
        },
    )

    db.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = None

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    @login_manager.unauthorized_handler
    def unauthorized():
        return jsonify({"status": "error", "message": "未登录"}), 401

    app.register_blueprint(auth_bp, url_prefix="/api")

    with app.app_context():
        db.create_all()

    return app
