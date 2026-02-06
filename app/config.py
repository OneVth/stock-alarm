"""애플리케이션 설정 모듈"""

import logging
import os
from pathlib import Path

from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

# 프로젝트 루트 디렉토리
BASE_DIR = Path(__file__).resolve().parent.parent


class Config:
    """애플리케이션 설정"""

    # Flask
    SECRET_KEY = os.environ.get("FLASK_SECRET_KEY", "dev-secret-key")

    # Database
    DATABASE_PATH = os.environ.get("DATABASE_PATH", "data/stock_alarm.db")
    SQLALCHEMY_DATABASE_URI = f"sqlite:///{BASE_DIR / DATABASE_PATH}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Gmail SMTP
    GMAIL_ADDRESS = os.environ.get("GMAIL_ADDRESS")
    GMAIL_APP_PASSWORD = os.environ.get("GMAIL_APP_PASSWORD")
    MAIL_FROM_ADDRESS = os.environ.get("MAIL_FROM_ADDRESS")  # 발신자 표시 주소
    MAIL_FROM_NAME = os.environ.get("MAIL_FROM_NAME", "Stock Alarm")  # 발신자 이름

    # OpenAI
    OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")

    # Logging
    LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO")
    LOG_DIR = BASE_DIR / "logs"
    LOG_FILE = "app.log"
    LOG_FORMAT = "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"
    LOG_DATE_FORMAT = "%Y-%m-%d %H:%M:%S"
    LOG_MAX_BYTES = 10 * 1024 * 1024  # 10MB
    LOG_BACKUP_COUNT = 5


class DevelopmentConfig(Config):
    """개발 환경 설정"""

    DEBUG = True
    LOG_LEVEL = "DEBUG"


class ProductionConfig(Config):
    """프로덕션 환경 설정"""

    DEBUG = False
    LOG_LEVEL = "INFO"


class TestConfig(Config):
    """테스트 환경 설정"""

    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    WTF_CSRF_ENABLED = False
    LOG_LEVEL = "WARNING"
