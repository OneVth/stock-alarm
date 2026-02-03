"""Phase 2: 사용자 인증 플로우 테스트"""

import uuid
from unittest.mock import patch

from app import db
from app.models import User
from app.routes.main import is_valid_email


class TestEmailValidation:
    """이메일 유효성 검증 테스트"""

    def test_valid_email(self):
        """유효한 이메일 형식"""
        assert is_valid_email("user@example.com") is True
        assert is_valid_email("test.user@domain.co.kr") is True
        assert is_valid_email("user+tag@gmail.com") is True

    def test_invalid_email_empty(self):
        """빈 이메일"""
        assert is_valid_email("") is False
        assert is_valid_email(None) is False

    def test_invalid_email_format(self):
        """잘못된 이메일 형식"""
        assert is_valid_email("invalid") is False
        assert is_valid_email("invalid@") is False
        assert is_valid_email("@domain.com") is False
        assert is_valid_email("user@domain") is False


class TestHomeRoute:
    """홈페이지 라우트 테스트"""

    def test_home_page_returns_200(self, client):
        """홈페이지 접근 시 200 반환"""
        response = client.get("/")
        assert response.status_code == 200

    def test_home_page_contains_email_form(self, client):
        """홈페이지에 이메일 폼 포함"""
        response = client.get("/")
        assert b'name="email"' in response.data
        assert b'action="/register"' in response.data


class TestRegisterRoute:
    """이메일 등록 라우트 테스트"""

    def test_register_empty_email(self, client):
        """빈 이메일로 등록 시 에러"""
        response = client.post("/register", data={"email": ""}, follow_redirects=True)
        assert response.status_code == 200
        assert "이메일 주소를 입력해주세요".encode("utf-8") in response.data

    def test_register_invalid_email(self, client):
        """잘못된 형식의 이메일로 등록 시 에러"""
        response = client.post(
            "/register", data={"email": "invalid-email"}, follow_redirects=True
        )
        assert response.status_code == 200
        assert "올바른 이메일 주소를 입력해주세요".encode("utf-8") in response.data

    @patch("app.routes.main.send_welcome_email")
    def test_register_new_user_success(self, mock_send_email, app, client):
        """신규 사용자 등록 성공"""
        mock_send_email.return_value = True

        response = client.post(
            "/register", data={"email": "newuser@example.com"}, follow_redirects=True
        )

        assert response.status_code == 200
        assert (
            "설정 페이지 URL이 이메일로 발송되었습니다".encode("utf-8") in response.data
        )

        # DB에 사용자가 생성되었는지 확인
        with app.app_context():
            user = User.query.filter_by(email="newuser@example.com").first()
            assert user is not None
            assert user.uuid is not None

        # 이메일 발송 함수가 호출되었는지 확인
        mock_send_email.assert_called_once()

    @patch("app.routes.main.send_welcome_email")
    def test_register_existing_user_success(self, mock_send_email, app, client):
        """기존 사용자 재등록 시 기존 UUID 사용"""
        mock_send_email.return_value = True

        # 기존 사용자 생성
        existing_uuid = str(uuid.uuid4())
        with app.app_context():
            user = User(email="existing@example.com", uuid=existing_uuid)
            db.session.add(user)
            db.session.commit()

        response = client.post(
            "/register", data={"email": "existing@example.com"}, follow_redirects=True
        )

        assert response.status_code == 200
        assert (
            "설정 페이지 URL이 이메일로 발송되었습니다".encode("utf-8") in response.data
        )

        # UUID가 변경되지 않았는지 확인
        with app.app_context():
            user = User.query.filter_by(email="existing@example.com").first()
            assert user.uuid == existing_uuid

    @patch("app.routes.main.send_welcome_email")
    def test_register_email_send_failure(self, mock_send_email, client):
        """이메일 발송 실패 시 에러 메시지"""
        mock_send_email.return_value = False

        response = client.post(
            "/register", data={"email": "user@example.com"}, follow_redirects=True
        )

        assert response.status_code == 200
        assert "이메일 발송에 실패했습니다".encode("utf-8") in response.data

    def test_register_redirects_to_home(self, client):
        """등록 후 홈페이지로 리다이렉트"""
        with patch("app.routes.main.send_welcome_email", return_value=True):
            response = client.post(
                "/register", data={"email": "user@example.com"}, follow_redirects=False
            )
            assert response.status_code == 302
            assert response.location == "/"


class TestMailService:
    """이메일 서비스 테스트"""

    def test_send_welcome_email_without_config(self, app):
        """Gmail 설정 없이 이메일 발송 시 실패"""
        from app.services.mail import send_welcome_email

        with app.app_context():
            # 설정 제거
            app.config["GMAIL_ADDRESS"] = None
            app.config["GMAIL_APP_PASSWORD"] = None

            result = send_welcome_email(
                "test@example.com", "http://example.com/settings/abc"
            )
            assert result is False
