"""알림 체크 스크립트 테스트 (check_alert.py)

base_price 갱신 로직 검증:
- 알림 발송 후 base_price가 현재가로 갱신되는지
- status가 active로 유지되는지
- AlertLog에 갱신 전 base_price가 기록되는지
"""

import uuid
from unittest.mock import patch

import pytest

from app import db
from app.models import User, Alert, AlertLog
from scripts.check_alert import process_alert, is_threshold_reached


# ============================================================
# is_threshold_reached 테스트
# ============================================================


class TestIsThresholdReached:
    """알림 기준 충족 판단 테스트"""

    def _make_alert(self, base_price, upper=10.0, lower=-10.0):
        """테스트용 Alert 객체 생성 (DB 저장 없이)"""
        alert = Alert(
            stock_code="005930",
            stock_name="삼성전자",
            base_price=base_price,
            threshold_upper=upper,
            threshold_lower=lower,
            status="active",
        )
        return alert

    def test_upper_threshold_reached(self):
        """상승 기준 충족"""
        alert = self._make_alert(base_price=100000, upper=10.0)
        reached, threshold_type = is_threshold_reached(alert, 110000)
        assert reached is True
        assert threshold_type == "upper"

    def test_upper_threshold_not_reached(self):
        """상승 기준 미충족"""
        alert = self._make_alert(base_price=100000, upper=10.0)
        reached, threshold_type = is_threshold_reached(alert, 109000)
        assert reached is False
        assert threshold_type is None

    def test_lower_threshold_reached(self):
        """하락 기준 충족"""
        alert = self._make_alert(base_price=100000, lower=-10.0)
        reached, threshold_type = is_threshold_reached(alert, 90000)
        assert reached is True
        assert threshold_type == "lower"

    def test_lower_threshold_not_reached(self):
        """하락 기준 미충족"""
        alert = self._make_alert(base_price=100000, lower=-10.0)
        reached, threshold_type = is_threshold_reached(alert, 91000)
        assert reached is False
        assert threshold_type is None

    def test_exact_threshold(self):
        """정확히 기준치에 도달"""
        alert = self._make_alert(base_price=100000, upper=10.0)
        reached, threshold_type = is_threshold_reached(alert, 110000)
        assert reached is True
        assert threshold_type == "upper"


# ============================================================
# process_alert 테스트 (base_price 갱신 핵심 로직)
# ============================================================


class TestProcessAlert:
    """알림 처리 및 base_price 갱신 테스트"""

    @pytest.fixture
    def user_and_alert(self, app):
        """테스트용 User + Alert 생성"""
        with app.app_context():
            user = User(email="test@example.com", uuid=str(uuid.uuid4()))
            db.session.add(user)
            db.session.commit()

            alert = Alert(
                user_id=user.id,
                stock_code="005930",
                stock_name="삼성전자",
                base_price=100000,
                threshold_upper=10.0,
                threshold_lower=-10.0,
                status="active",
            )
            db.session.add(alert)
            db.session.commit()

            yield user, alert

    @patch("scripts.check_alert.send_alert_email", return_value=True)
    @patch("scripts.check_alert.generate_alert_comment", return_value="테스트 코멘트")
    @patch("scripts.check_alert.get_market_summary", return_value={
        "kospi": 2650, "kosdaq": 845,
        "kospi_change": 0, "kosdaq_change": 0,
        "kospi_change_rate": 0, "kosdaq_change_rate": 0,
    })
    @patch("scripts.check_alert.get_stock_price")
    def test_base_price_updated_after_trigger(
        self, mock_price, mock_market, mock_llm, mock_email, app, user_and_alert
    ):
        """알림 발송 후 base_price가 현재가로 갱신되는지 확인"""
        mock_price.return_value = 110000  # +10% → 기준 충족

        with app.app_context():
            user, alert = user_and_alert
            # DB에서 다시 조회 (세션 바인딩)
            alert = db.session.get(Alert, alert.id)

            result = process_alert(alert, app)

            assert result["status"] == "triggered"
            assert alert.base_price == 110000  # 현재가로 갱신됨

    @patch("scripts.check_alert.send_alert_email", return_value=True)
    @patch("scripts.check_alert.generate_alert_comment", return_value="테스트 코멘트")
    @patch("scripts.check_alert.get_market_summary", return_value={
        "kospi": 2650, "kosdaq": 845,
        "kospi_change": 0, "kosdaq_change": 0,
        "kospi_change_rate": 0, "kosdaq_change_rate": 0,
    })
    @patch("scripts.check_alert.get_stock_price")
    def test_status_remains_active_after_trigger(
        self, mock_price, mock_market, mock_llm, mock_email, app, user_and_alert
    ):
        """알림 발송 후 status가 active로 유지되는지 확인"""
        mock_price.return_value = 110000

        with app.app_context():
            user, alert = user_and_alert
            alert = db.session.get(Alert, alert.id)

            process_alert(alert, app)

            assert alert.status == "active"

    @patch("scripts.check_alert.send_alert_email", return_value=True)
    @patch("scripts.check_alert.generate_alert_comment", return_value="테스트 코멘트")
    @patch("scripts.check_alert.get_market_summary", return_value={
        "kospi": 2650, "kosdaq": 845,
        "kospi_change": 0, "kosdaq_change": 0,
        "kospi_change_rate": 0, "kosdaq_change_rate": 0,
    })
    @patch("scripts.check_alert.get_stock_price")
    def test_alert_log_records_original_base_price(
        self, mock_price, mock_market, mock_llm, mock_email, app, user_and_alert
    ):
        """AlertLog에 갱신 전 base_price가 기록되는지 확인"""
        mock_price.return_value = 110000
        original_base_price = 100000

        with app.app_context():
            user, alert = user_and_alert
            alert = db.session.get(Alert, alert.id)

            process_alert(alert, app)

            log = AlertLog.query.filter_by(alert_id=alert.id).first()
            assert log is not None
            assert log.base_price == original_base_price  # 갱신 전 기준가
            assert log.current_price == 110000
            assert log.threshold_type == "upper"

    @patch("scripts.check_alert.get_stock_price")
    def test_not_triggered_no_base_price_change(
        self, mock_price, app, user_and_alert
    ):
        """기준 미충족 시 base_price 변경 없음"""
        mock_price.return_value = 105000  # +5% → 기준 미충족

        with app.app_context():
            user, alert = user_and_alert
            alert = db.session.get(Alert, alert.id)

            result = process_alert(alert, app)

            assert result["status"] == "not_triggered"
            assert alert.base_price == 100000  # 변경 없음

    @patch("scripts.check_alert.get_stock_price")
    def test_price_fetch_failure(self, mock_price, app, user_and_alert):
        """현재가 조회 실패 시 에러 반환"""
        mock_price.return_value = None

        with app.app_context():
            user, alert = user_and_alert
            alert = db.session.get(Alert, alert.id)

            result = process_alert(alert, app)

            assert result["status"] == "skipped"
            assert result["error"] == "현재가 조회 실패"
            assert alert.base_price == 100000  # 변경 없음

    @patch("scripts.check_alert.send_alert_email", return_value=True)
    @patch("scripts.check_alert.generate_alert_comment", return_value="테스트 코멘트")
    @patch("scripts.check_alert.get_market_summary", return_value={
        "kospi": 2650, "kosdaq": 845,
        "kospi_change": 0, "kosdaq_change": 0,
        "kospi_change_rate": 0, "kosdaq_change_rate": 0,
    })
    @patch("scripts.check_alert.get_stock_price")
    def test_lower_threshold_trigger_updates_base_price(
        self, mock_price, mock_market, mock_llm, mock_email, app, user_and_alert
    ):
        """하락 기준 충족 시에도 base_price가 현재가로 갱신되는지 확인"""
        mock_price.return_value = 90000  # -10% → 하락 기준 충족

        with app.app_context():
            user, alert = user_and_alert
            alert = db.session.get(Alert, alert.id)

            result = process_alert(alert, app)

            assert result["status"] == "triggered"
            assert alert.base_price == 90000
            assert alert.status == "active"

            log = AlertLog.query.filter_by(alert_id=alert.id).first()
            assert log.threshold_type == "lower"
            assert log.base_price == 100000  # 갱신 전 기준가
