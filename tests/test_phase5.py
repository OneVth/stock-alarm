"""Phase 5: 알림 체크 스크립트 테스트"""

import sys
from datetime import datetime
from pathlib import Path
from unittest.mock import patch, MagicMock

import pytest

# 프로젝트 루트를 Python 경로에 추가 (스크립트 임포트를 위해)
project_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(project_root))

from app import db
from app.models import User, Alert, AlertLog
from app.services.mail import send_alert_email
from scripts.check_alert import is_threshold_reached, process_alert, check_alerts


class TestIsThresholdReached:
    """기준 충족 판단 테스트"""

    def test_upper_threshold_reached(self, app):
        """상승 기준 충족"""
        with app.app_context():
            alert = Alert(
                user_id=1,
                stock_code="005930",
                stock_name="삼성전자",
                base_price=70000,
                threshold_upper=5.0,
                threshold_lower=None,
                status="active",
            )
            # 5.0% 상승 (70000 -> 73500)
            reached, threshold_type = is_threshold_reached(alert, 73500)
            assert reached is True
            assert threshold_type == "upper"

    def test_upper_threshold_not_reached(self, app):
        """상승 기준 미충족"""
        with app.app_context():
            alert = Alert(
                user_id=1,
                stock_code="005930",
                stock_name="삼성전자",
                base_price=70000,
                threshold_upper=5.0,
                threshold_lower=None,
                status="active",
            )
            # 4.0% 상승 (70000 -> 72800)
            reached, threshold_type = is_threshold_reached(alert, 72800)
            assert reached is False
            assert threshold_type is None

    def test_lower_threshold_reached(self, app):
        """하락 기준 충족"""
        with app.app_context():
            alert = Alert(
                user_id=1,
                stock_code="005930",
                stock_name="삼성전자",
                base_price=70000,
                threshold_upper=None,
                threshold_lower=-3.0,
                status="active",
            )
            # -3.0% 하락 (70000 -> 67900)
            reached, threshold_type = is_threshold_reached(alert, 67900)
            assert reached is True
            assert threshold_type == "lower"

    def test_lower_threshold_not_reached(self, app):
        """하락 기준 미충족"""
        with app.app_context():
            alert = Alert(
                user_id=1,
                stock_code="005930",
                stock_name="삼성전자",
                base_price=70000,
                threshold_upper=None,
                threshold_lower=-3.0,
                status="active",
            )
            # -2.0% 하락 (70000 -> 68600)
            reached, threshold_type = is_threshold_reached(alert, 68600)
            assert reached is False
            assert threshold_type is None

    def test_both_thresholds_upper_reached_first(self, app):
        """상승+하락 기준 동시 설정, 상승 기준 먼저 충족"""
        with app.app_context():
            alert = Alert(
                user_id=1,
                stock_code="005930",
                stock_name="삼성전자",
                base_price=70000,
                threshold_upper=5.0,
                threshold_lower=-3.0,
                status="active",
            )
            # 5.0% 상승 (70000 -> 73500)
            reached, threshold_type = is_threshold_reached(alert, 73500)
            assert reached is True
            assert threshold_type == "upper"

    def test_both_thresholds_lower_reached(self, app):
        """상승+하락 기준 동시 설정, 하락 기준 충족"""
        with app.app_context():
            alert = Alert(
                user_id=1,
                stock_code="005930",
                stock_name="삼성전자",
                base_price=70000,
                threshold_upper=5.0,
                threshold_lower=-3.0,
                status="active",
            )
            # -3.0% 하락 (70000 -> 67900)
            reached, threshold_type = is_threshold_reached(alert, 67900)
            assert reached is True
            assert threshold_type == "lower"


class TestSendAlertEmail:
    """알림 이메일 발송 테스트"""

    def test_send_alert_email_success(self, app):
        """알림 이메일 발송 성공"""
        with app.app_context():
            app.config["GMAIL_ADDRESS"] = "test@gmail.com"
            app.config["GMAIL_APP_PASSWORD"] = "test-password"

            market_summary = {
                "kospi": 2650.42,
                "kosdaq": 845.67,
                "kospi_change": 12.35,
                "kosdaq_change": -3.21,
                "kospi_change_rate": 0.47,
                "kosdaq_change_rate": -0.38,
            }

            with patch("app.services.mail.smtplib.SMTP_SSL") as mock_smtp:
                mock_server = MagicMock()
                mock_smtp.return_value.__enter__.return_value = mock_server

                result = send_alert_email(
                    email="user@example.com",
                    stock_name="삼성전자",
                    stock_code="005930",
                    base_price=70000,
                    current_price=73500,
                    change_rate=5.0,
                    threshold_type="upper",
                    threshold_value=5.0,
                    market_summary=market_summary,
                    llm_comment="삼성전자가 5% 상승했습니다.",
                    settings_url="https://stockalarm.co.kr/settings/test-uuid",
                )

                assert result is True
                mock_server.sendmail.assert_called_once()

    def test_send_alert_email_no_config(self, app):
        """Gmail 설정 없을 때 실패"""
        with app.app_context():
            app.config["GMAIL_ADDRESS"] = None
            app.config["GMAIL_APP_PASSWORD"] = None

            result = send_alert_email(
                email="user@example.com",
                stock_name="삼성전자",
                stock_code="005930",
                base_price=70000,
                current_price=73500,
                change_rate=5.0,
                threshold_type="upper",
                threshold_value=5.0,
                market_summary={},
                llm_comment="코멘트",
                settings_url="https://stockalarm.co.kr/settings/test-uuid",
            )

            assert result is False

    def test_send_alert_email_smtp_error(self, app):
        """SMTP 오류 시 실패"""
        with app.app_context():
            app.config["GMAIL_ADDRESS"] = "test@gmail.com"
            app.config["GMAIL_APP_PASSWORD"] = "test-password"

            with patch("app.services.mail.smtplib.SMTP_SSL") as mock_smtp:
                mock_smtp.return_value.__enter__.side_effect = Exception("SMTP Error")

                result = send_alert_email(
                    email="user@example.com",
                    stock_name="삼성전자",
                    stock_code="005930",
                    base_price=70000,
                    current_price=73500,
                    change_rate=5.0,
                    threshold_type="upper",
                    threshold_value=5.0,
                    market_summary={},
                    llm_comment="코멘트",
                    settings_url="https://stockalarm.co.kr/settings/test-uuid",
                )

                assert result is False


class TestProcessAlert:
    """단일 알림 처리 테스트"""

    @pytest.fixture
    def user_with_alert(self, app):
        """테스트용 사용자와 알림"""
        with app.app_context():
            user = User(email="test@example.com", uuid="test-uuid-123")
            db.session.add(user)
            db.session.commit()

            alert = Alert(
                user_id=user.id,
                stock_code="005930",
                stock_name="삼성전자",
                base_price=70000,
                threshold_upper=5.0,
                threshold_lower=None,
                status="active",
            )
            db.session.add(alert)
            db.session.commit()

            yield {"user": user, "alert": alert}

    def test_process_alert_price_fetch_failure(self, app, user_with_alert):
        """현재가 조회 실패 시 스킵"""
        with app.app_context():
            alert = Alert.query.get(user_with_alert["alert"].id)

            with patch("scripts.check_alert.get_stock_price", return_value=None):
                result = process_alert(alert, app)

            assert result["status"] == "skipped"
            assert result["error"] == "현재가 조회 실패"

    def test_process_alert_not_triggered(self, app, user_with_alert):
        """기준 미충족 시 not_triggered"""
        with app.app_context():
            alert = Alert.query.get(user_with_alert["alert"].id)

            with patch("scripts.check_alert.get_stock_price", return_value=72000):
                result = process_alert(alert, app)

            assert result["status"] == "not_triggered"
            assert result["email_sent"] is None

    @patch("scripts.check_alert.send_alert_email")
    @patch("scripts.check_alert.generate_alert_comment")
    @patch("scripts.check_alert.get_market_summary")
    @patch("scripts.check_alert.get_stock_price")
    def test_process_alert_triggered_email_sent(
        self,
        mock_get_price,
        mock_get_market,
        mock_generate_comment,
        mock_send_email,
        app,
        user_with_alert,
    ):
        """기준 충족 시 이메일 발송 성공"""
        mock_get_price.return_value = 73500  # 5% 상승
        mock_get_market.return_value = {
            "kospi": 2650.42,
            "kosdaq": 845.67,
            "kospi_change": 12.35,
            "kosdaq_change": -3.21,
            "kospi_change_rate": 0.47,
            "kosdaq_change_rate": -0.38,
        }
        mock_generate_comment.return_value = "삼성전자가 5% 상승했습니다."
        mock_send_email.return_value = True

        with app.app_context():
            alert = Alert.query.get(user_with_alert["alert"].id)
            result = process_alert(alert, app)

            assert result["status"] == "triggered"
            assert result["email_sent"] is True

            # Alert 상태 확인: active 유지, base_price 갱신
            updated_alert = Alert.query.get(alert.id)
            assert updated_alert.status == "active"
            assert updated_alert.base_price == 73500

            # AlertLog 확인
            log = AlertLog.query.filter_by(alert_id=alert.id).first()
            assert log is not None
            assert log.change_rate == pytest.approx(5.0, rel=0.01)
            assert log.threshold_type == "upper"
            assert log.email_sent is True

    @patch("scripts.check_alert.send_alert_email")
    @patch("scripts.check_alert.generate_alert_comment")
    @patch("scripts.check_alert.get_market_summary")
    @patch("scripts.check_alert.get_stock_price")
    def test_process_alert_triggered_email_failed(
        self,
        mock_get_price,
        mock_get_market,
        mock_generate_comment,
        mock_send_email,
        app,
        user_with_alert,
    ):
        """기준 충족, 이메일 발송 실패"""
        mock_get_price.return_value = 73500
        mock_get_market.return_value = {"kospi": 2650, "kosdaq": 845}
        mock_generate_comment.return_value = "코멘트"
        mock_send_email.return_value = False

        with app.app_context():
            alert = Alert.query.get(user_with_alert["alert"].id)
            result = process_alert(alert, app)

            assert result["status"] == "triggered"
            assert result["email_sent"] is False

            # AlertLog에 email_sent=False로 기록
            log = AlertLog.query.filter_by(alert_id=alert.id).first()
            assert log.email_sent is False

            # Alert 상태는 active 유지, base_price 갱신
            updated_alert = Alert.query.get(alert.id)
            assert updated_alert.status == "active"
            assert updated_alert.base_price == 73500

    @patch("scripts.check_alert.send_alert_email")
    @patch("scripts.check_alert.get_fallback_comment")
    @patch("scripts.check_alert.generate_alert_comment")
    @patch("scripts.check_alert.get_market_summary")
    @patch("scripts.check_alert.get_stock_price")
    def test_process_alert_llm_failure_use_fallback(
        self,
        mock_get_price,
        mock_get_market,
        mock_generate_comment,
        mock_get_fallback,
        mock_send_email,
        app,
        user_with_alert,
    ):
        """LLM 코멘트 생성 실패 시 폴백 코멘트 사용"""
        mock_get_price.return_value = 73500
        mock_get_market.return_value = {"kospi": 2650, "kosdaq": 845}
        mock_generate_comment.return_value = None  # LLM 실패
        mock_get_fallback.return_value = "삼성전자이(가) 등록가 대비 5.00% 상승하여 설정하신 상승 기준에 도달했습니다."
        mock_send_email.return_value = True

        with app.app_context():
            alert = Alert.query.get(user_with_alert["alert"].id)
            result = process_alert(alert, app)

            assert result["status"] == "triggered"
            assert result["email_sent"] is True
            mock_get_fallback.assert_called_once()


class TestCheckAlerts:
    """전체 알림 체크 테스트"""

    def test_check_alerts_no_active_alerts(self, app):
        """활성 알림 없음"""
        with patch("scripts.check_alert.create_app") as mock_create_app:
            mock_create_app.return_value = app

            with app.app_context():
                result = check_alerts()

            assert result["total"] == 0
            assert result["checked"] == 0
            assert result["triggered"] == 0

    @patch("scripts.check_alert.process_alert")
    def test_check_alerts_multiple_alerts(self, mock_process, app):
        """복수 알림 처리"""
        with app.app_context():
            # 테스트 데이터 생성
            user = User(email="test@example.com", uuid="test-uuid")
            db.session.add(user)
            db.session.commit()

            for i in range(3):
                alert = Alert(
                    user_id=user.id,
                    stock_code=f"00593{i}",
                    stock_name=f"테스트종목{i}",
                    base_price=70000,
                    threshold_upper=5.0,
                    status="active",
                )
                db.session.add(alert)
            db.session.commit()

        # process_alert 결과 모킹
        mock_process.side_effect = [
            {"status": "triggered", "email_sent": True, "error": None},
            {"status": "not_triggered", "email_sent": None, "error": None},
            {"status": "triggered", "email_sent": False, "error": None},
        ]

        with patch("scripts.check_alert.create_app") as mock_create_app:
            mock_create_app.return_value = app

            with app.app_context():
                result = check_alerts()

        assert result["total"] == 3
        assert result["checked"] == 3
        assert result["triggered"] == 2
        assert result["email_sent"] == 1
        assert result["email_failed"] == 1

    @patch("scripts.check_alert.process_alert")
    def test_check_alerts_with_errors(self, mock_process, app):
        """오류 발생 시 에러 목록 기록"""
        with app.app_context():
            user = User(email="test@example.com", uuid="test-uuid")
            db.session.add(user)
            db.session.commit()

            alert = Alert(
                user_id=user.id,
                stock_code="005930",
                stock_name="삼성전자",
                base_price=70000,
                threshold_upper=5.0,
                status="active",
            )
            db.session.add(alert)
            db.session.commit()

        mock_process.return_value = {
            "status": "skipped",
            "email_sent": None,
            "error": "현재가 조회 실패",
        }

        with patch("scripts.check_alert.create_app") as mock_create_app:
            mock_create_app.return_value = app

            with app.app_context():
                result = check_alerts()

        assert result["total"] == 1
        assert result["checked"] == 1
        assert len(result["errors"]) == 1
        assert result["errors"][0]["error"] == "현재가 조회 실패"


class TestIntegration:
    """통합 테스트"""

    @patch("scripts.check_alert.send_alert_email")
    @patch("scripts.check_alert.generate_alert_comment")
    @patch("scripts.check_alert.get_market_summary")
    @patch("scripts.check_alert.get_stock_price")
    def test_full_flow_upper_threshold(
        self,
        mock_get_price,
        mock_get_market,
        mock_generate_comment,
        mock_send_email,
        app,
    ):
        """전체 흐름 통합 테스트 - 상승 기준"""
        mock_get_price.return_value = 73500  # 5% 상승
        mock_get_market.return_value = {
            "kospi": 2650.42,
            "kosdaq": 845.67,
            "kospi_change": 12.35,
            "kosdaq_change": -3.21,
            "kospi_change_rate": 0.47,
            "kosdaq_change_rate": -0.38,
        }
        mock_generate_comment.return_value = "삼성전자가 등록가 대비 5% 상승했습니다."
        mock_send_email.return_value = True

        with app.app_context():
            # 테스트 데이터 생성
            user = User(email="test@example.com", uuid="test-uuid")
            db.session.add(user)
            db.session.commit()

            alert = Alert(
                user_id=user.id,
                stock_code="005930",
                stock_name="삼성전자",
                base_price=70000,
                threshold_upper=5.0,
                status="active",
            )
            db.session.add(alert)
            db.session.commit()
            alert_id = alert.id

        with patch("scripts.check_alert.create_app") as mock_create_app:
            mock_create_app.return_value = app

            with app.app_context():
                result = check_alerts()

        assert result["total"] == 1
        assert result["triggered"] == 1
        assert result["email_sent"] == 1

        with app.app_context():
            # Alert 상태 확인: active 유지, base_price 갱신
            alert = Alert.query.get(alert_id)
            assert alert.status == "active"
            assert alert.base_price == 73500

            # AlertLog 확인
            log = AlertLog.query.filter_by(alert_id=alert_id).first()
            assert log is not None
            assert log.threshold_type == "upper"
            assert log.email_sent is True

    @patch("scripts.check_alert.send_alert_email")
    @patch("scripts.check_alert.generate_alert_comment")
    @patch("scripts.check_alert.get_market_summary")
    @patch("scripts.check_alert.get_stock_price")
    def test_full_flow_lower_threshold(
        self,
        mock_get_price,
        mock_get_market,
        mock_generate_comment,
        mock_send_email,
        app,
    ):
        """전체 흐름 통합 테스트 - 하락 기준"""
        mock_get_price.return_value = 67900  # 3% 하락
        mock_get_market.return_value = {"kospi": 2500, "kosdaq": 800}
        mock_generate_comment.return_value = "삼성전자가 등록가 대비 3% 하락했습니다."
        mock_send_email.return_value = True

        with app.app_context():
            user = User(email="test@example.com", uuid="test-uuid")
            db.session.add(user)
            db.session.commit()

            alert = Alert(
                user_id=user.id,
                stock_code="005930",
                stock_name="삼성전자",
                base_price=70000,
                threshold_lower=-3.0,
                status="active",
            )
            db.session.add(alert)
            db.session.commit()
            alert_id = alert.id

        with patch("scripts.check_alert.create_app") as mock_create_app:
            mock_create_app.return_value = app

            with app.app_context():
                result = check_alerts()

        assert result["triggered"] == 1
        assert result["email_sent"] == 1

        with app.app_context():
            log = AlertLog.query.filter_by(alert_id=alert_id).first()
            assert log.threshold_type == "lower"
