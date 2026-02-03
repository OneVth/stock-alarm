"""라우트 테스트"""

import uuid

from app import db
from app.models import User


class TestMainRoutes:
    """메인 라우트 테스트"""

    def test_home_page(self, client):
        """홈페이지 접근 테스트"""
        response = client.get("/")
        assert response.status_code == 200

    def test_home_page_contains_form(self, client):
        """홈페이지에 이메일 폼이 있는지 확인"""
        response = client.get("/")
        assert b"email" in response.data.lower()


class TestSettingsRoutes:
    """설정 라우트 테스트"""

    def test_settings_page_with_valid_uuid(self, app, client):
        """유효한 UUID로 설정 페이지 접근"""
        with app.app_context():
            user_uuid = str(uuid.uuid4())
            user = User(email="test@example.com", uuid=user_uuid)
            db.session.add(user)
            db.session.commit()

        response = client.get(f"/settings/{user_uuid}")
        assert response.status_code == 200

    def test_settings_page_with_invalid_uuid(self, client):
        """잘못된 UUID로 설정 페이지 접근 시 404"""
        response = client.get("/settings/invalid-uuid")
        assert response.status_code == 404

    def test_settings_page_shows_user_email(self, app, client):
        """설정 페이지에 사용자 이메일이 표시되는지 확인"""
        with app.app_context():
            user_uuid = str(uuid.uuid4())
            user = User(email="test@example.com", uuid=user_uuid)
            db.session.add(user)
            db.session.commit()

        response = client.get(f"/settings/{user_uuid}")
        assert b"test@example.com" in response.data
