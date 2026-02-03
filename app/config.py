"""애플리케이션 설정 모듈"""

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

    # OpenAI
    OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
