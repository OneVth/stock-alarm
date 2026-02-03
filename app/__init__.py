"""Flask 애플리케이션 팩토리"""

from flask import Flask
from flask_sqlalchemy import SQLAlchemy

from app.config import Config

db = SQLAlchemy()


def create_app(config_class=Config):
    """Flask 애플리케이션 생성"""
    app = Flask(__name__)
    app.config.from_object(config_class)

    # 확장 초기화
    db.init_app(app)

    # Blueprint 등록
    from app.routes.main import main_bp
    from app.routes.settings import settings_bp

    app.register_blueprint(main_bp)
    app.register_blueprint(settings_bp)

    # 데이터베이스 테이블 생성
    with app.app_context():
        db.create_all()

    return app
