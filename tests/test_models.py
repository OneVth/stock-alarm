"""데이터베이스 모델 테스트"""

import uuid
from datetime import datetime

import pytest

from app import db
from app.models import User, Alert, AlertLog


class TestUserModel:
    """User 모델 테스트"""

    def test_create_user(self, app):
        """사용자 생성 테스트"""
        with app.app_context():
            user = User(email="test@example.com", uuid=str(uuid.uuid4()))
            db.session.add(user)
            db.session.commit()

            assert user.id is not None
            assert user.email == "test@example.com"
            assert user.created_at is not None

    def test_user_email_unique(self, app):
        """이메일 중복 방지 테스트"""
        with app.app_context():
            user1 = User(email="test@example.com", uuid=str(uuid.uuid4()))
            db.session.add(user1)
            db.session.commit()

            user2 = User(email="test@example.com", uuid=str(uuid.uuid4()))
            db.session.add(user2)

            with pytest.raises(Exception):
                db.session.commit()

    def test_user_uuid_unique(self, app):
        """UUID 중복 방지 테스트"""
        with app.app_context():
            same_uuid = str(uuid.uuid4())
            user1 = User(email="test1@example.com", uuid=same_uuid)
            db.session.add(user1)
            db.session.commit()

            user2 = User(email="test2@example.com", uuid=same_uuid)
            db.session.add(user2)

            with pytest.raises(Exception):
                db.session.commit()

    def test_user_repr(self, app):
        """User __repr__ 테스트"""
        with app.app_context():
            user = User(email="test@example.com", uuid=str(uuid.uuid4()))
            assert "test@example.com" in repr(user)


class TestAlertModel:
    """Alert 모델 테스트"""

    def test_create_alert(self, app):
        """알림 생성 테스트"""
        with app.app_context():
            user = User(email="test@example.com", uuid=str(uuid.uuid4()))
            db.session.add(user)
            db.session.commit()

            alert = Alert(
                user_id=user.id,
                stock_code="005930",
                stock_name="삼성전자",
                base_price=70000.0,
                threshold_upper=10.0,
                threshold_lower=-10.0,
            )
            db.session.add(alert)
            db.session.commit()

            assert alert.id is not None
            assert alert.status == "active"
            assert alert.triggered_at is None

    def test_alert_default_status(self, app):
        """알림 기본 상태가 active인지 확인"""
        with app.app_context():
            user = User(email="test@example.com", uuid=str(uuid.uuid4()))
            db.session.add(user)
            db.session.commit()

            alert = Alert(
                user_id=user.id,
                stock_code="005930",
                stock_name="삼성전자",
                base_price=70000.0,
            )
            db.session.add(alert)
            db.session.commit()

            assert alert.status == "active"

    def test_alert_user_relationship(self, app):
        """알림-사용자 관계 테스트"""
        with app.app_context():
            user = User(email="test@example.com", uuid=str(uuid.uuid4()))
            db.session.add(user)
            db.session.commit()

            alert = Alert(
                user_id=user.id,
                stock_code="005930",
                stock_name="삼성전자",
                base_price=70000.0,
            )
            db.session.add(alert)
            db.session.commit()

            assert alert.user == user
            assert alert in user.alerts

    def test_alert_cascade_delete(self, app):
        """사용자 삭제 시 알림도 삭제되는지 확인"""
        with app.app_context():
            user = User(email="test@example.com", uuid=str(uuid.uuid4()))
            db.session.add(user)
            db.session.commit()

            alert = Alert(
                user_id=user.id,
                stock_code="005930",
                stock_name="삼성전자",
                base_price=70000.0,
            )
            db.session.add(alert)
            db.session.commit()

            alert_id = alert.id
            db.session.delete(user)
            db.session.commit()

            assert Alert.query.get(alert_id) is None

    def test_alert_repr(self, app):
        """Alert __repr__ 테스트"""
        with app.app_context():
            user = User(email="test@example.com", uuid=str(uuid.uuid4()))
            db.session.add(user)
            db.session.commit()

            alert = Alert(
                user_id=user.id,
                stock_code="005930",
                stock_name="삼성전자",
                base_price=70000.0,
            )
            assert "삼성전자" in repr(alert)
            assert "005930" in repr(alert)


class TestAlertLogModel:
    """AlertLog 모델 테스트"""

    def test_create_alert_log(self, app):
        """알림 로그 생성 테스트"""
        with app.app_context():
            user = User(email="test@example.com", uuid=str(uuid.uuid4()))
            db.session.add(user)
            db.session.commit()

            alert = Alert(
                user_id=user.id,
                stock_code="005930",
                stock_name="삼성전자",
                base_price=70000.0,
            )
            db.session.add(alert)
            db.session.commit()

            log = AlertLog(
                alert_id=alert.id,
                user_id=user.id,
                stock_code="005930",
                base_price=70000.0,
                current_price=77000.0,
                change_rate=10.0,
                threshold_type="upper",
                email_sent=True,
            )
            db.session.add(log)
            db.session.commit()

            assert log.id is not None
            assert log.sent_at is not None

    def test_alert_log_relationship(self, app):
        """알림 로그-알림 관계 테스트"""
        with app.app_context():
            user = User(email="test@example.com", uuid=str(uuid.uuid4()))
            db.session.add(user)
            db.session.commit()

            alert = Alert(
                user_id=user.id,
                stock_code="005930",
                stock_name="삼성전자",
                base_price=70000.0,
            )
            db.session.add(alert)
            db.session.commit()

            log = AlertLog(
                alert_id=alert.id,
                user_id=user.id,
                stock_code="005930",
                base_price=70000.0,
                current_price=77000.0,
                change_rate=10.0,
                threshold_type="upper",
                email_sent=True,
            )
            db.session.add(log)
            db.session.commit()

            assert log.alert == alert
            assert log in alert.logs

    def test_alert_log_repr(self, app):
        """AlertLog __repr__ 테스트"""
        with app.app_context():
            user = User(email="test@example.com", uuid=str(uuid.uuid4()))
            db.session.add(user)
            db.session.commit()

            alert = Alert(
                user_id=user.id,
                stock_code="005930",
                stock_name="삼성전자",
                base_price=70000.0,
            )
            db.session.add(alert)
            db.session.commit()

            log = AlertLog(
                alert_id=alert.id,
                user_id=user.id,
                stock_code="005930",
                base_price=70000.0,
                current_price=77000.0,
                change_rate=10.0,
                threshold_type="upper",
                email_sent=True,
            )

            assert "005930" in repr(log)
            assert "10.00" in repr(log)
