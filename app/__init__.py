"""Flask 애플리케이션 팩토리"""

import logging
from logging.handlers import RotatingFileHandler

from flask import Flask, request
from flask_sqlalchemy import SQLAlchemy

from app.config import Config

db = SQLAlchemy()


def setup_logging(app):
    """로깅 설정"""
    # 로그 디렉토리 생성
    log_dir = app.config.get("LOG_DIR")
    if log_dir:
        log_dir.mkdir(parents=True, exist_ok=True)

    # 로그 포맷터
    formatter = logging.Formatter(
        app.config.get("LOG_FORMAT", "%(asctime)s | %(levelname)s | %(message)s"),
        datefmt=app.config.get("LOG_DATE_FORMAT", "%Y-%m-%d %H:%M:%S"),
    )

    # 로그 레벨
    log_level = getattr(logging, app.config.get("LOG_LEVEL", "INFO").upper())

    # 기존 핸들러 제거 (중복 방지)
    app.logger.handlers.clear()

    # 콘솔 핸들러
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    console_handler.setLevel(log_level)
    app.logger.addHandler(console_handler)

    # 파일 핸들러 (RotatingFileHandler)
    if log_dir:
        file_handler = RotatingFileHandler(
            log_dir / app.config.get("LOG_FILE", "app.log"),
            maxBytes=app.config.get("LOG_MAX_BYTES", 10 * 1024 * 1024),
            backupCount=app.config.get("LOG_BACKUP_COUNT", 5),
            encoding="utf-8",
        )
        file_handler.setFormatter(formatter)
        file_handler.setLevel(log_level)
        app.logger.addHandler(file_handler)

    # Flask 앱 로거 설정
    app.logger.setLevel(log_level)
    app.logger.propagate = False  # 부모 로거로 전파 방지

    # Werkzeug 로거 레벨 조정 (개발 서버 로그)
    logging.getLogger("werkzeug").setLevel(logging.WARNING)

    app.logger.info(f"로깅 설정 완료 (레벨: {app.config.get('LOG_LEVEL')})")


def setup_request_logging(app):
    """요청/응답 로깅 설정"""

    @app.before_request
    def log_request():
        """요청 로깅"""
        # 정적 파일 요청은 제외
        if request.path.startswith("/static"):
            return

        app.logger.debug(
            f"REQUEST | {request.method} {request.path} | "
            f"IP: {request.remote_addr}"
        )

    @app.after_request
    def log_response(response):
        """응답 로깅"""
        # 정적 파일 요청은 제외
        if request.path.startswith("/static"):
            return response

        # 에러 응답은 WARNING 레벨로 로깅
        if response.status_code >= 400:
            app.logger.warning(
                f"RESPONSE | {request.method} {request.path} | "
                f"Status: {response.status_code}"
            )
        else:
            app.logger.debug(
                f"RESPONSE | {request.method} {request.path} | "
                f"Status: {response.status_code}"
            )

        return response


def create_app(config_class=Config):
    """Flask 애플리케이션 생성"""
    app = Flask(__name__)
    app.config.from_object(config_class)

    # 로깅 설정
    setup_logging(app)
    setup_request_logging(app)

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

    app.logger.info("Flask 애플리케이션 초기화 완료")

    return app
