"""pytest 공통 fixture"""

import pytest

from app import create_app, db
from app.config import TestConfig


@pytest.fixture
def app():
    """테스트용 Flask 앱 생성"""
    app = create_app(TestConfig)

    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()


@pytest.fixture
def client(app):
    """테스트용 클라이언트"""
    return app.test_client()


@pytest.fixture
def runner(app):
    """테스트용 CLI 러너"""
    return app.test_cli_runner()
