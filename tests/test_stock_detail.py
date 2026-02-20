"""종목 상세 페이지 및 차트 데이터 API 테스트"""

import json
import uuid
from datetime import datetime
from unittest.mock import patch, MagicMock

import pandas as pd
import pytest

from app import db
from app.models import User, Alert, AlertLog


def _create_user_and_alert(app, **alert_kwargs):
    """테스트용 사용자 + 알림 생성 헬퍼"""
    with app.app_context():
        user_uuid = str(uuid.uuid4())
        user = User(email="test@example.com", uuid=user_uuid)
        db.session.add(user)
        db.session.flush()

        defaults = dict(
            user_id=user.id,
            stock_code="005930",
            stock_name="삼성전자",
            base_price=70000,
            threshold_upper=10.0,
            threshold_lower=-10.0,
            status="active",
        )
        defaults.update(alert_kwargs)
        alert = Alert(**defaults)
        db.session.add(alert)
        db.session.commit()

        return user_uuid, user.id, alert.id


class TestStockDetailRoute:
    """종목 상세 페이지 라우트 테스트"""

    @patch("app.routes.settings.get_stock_price", return_value=77000)
    def test_stock_detail_success(self, mock_price, app, client):
        """유효한 UUID/alert_id로 상세 페이지 접근"""
        user_uuid, _, alert_id = _create_user_and_alert(app)
        response = client.get(f"/settings/{user_uuid}/stock/{alert_id}")
        assert response.status_code == 200
        assert "삼성전자".encode() in response.data

    def test_stock_detail_invalid_uuid(self, client):
        """존재하지 않는 UUID → 404"""
        response = client.get("/settings/invalid-uuid/stock/1")
        assert response.status_code == 404

    @patch("app.routes.settings.get_stock_price", return_value=77000)
    def test_stock_detail_wrong_alert_id(self, mock_price, app, client):
        """다른 사용자의 alert_id → 404"""
        user_uuid, _, _ = _create_user_and_alert(app)
        response = client.get(f"/settings/{user_uuid}/stock/9999")
        assert response.status_code == 404

    @patch("app.routes.settings.get_stock_price", return_value=77000)
    def test_stock_detail_change_rate(self, mock_price, app, client):
        """변동률 계산 확인 (base_price: 70000, current: 77000 → +10%)"""
        user_uuid, _, alert_id = _create_user_and_alert(app)
        response = client.get(f"/settings/{user_uuid}/stock/{alert_id}")
        assert response.status_code == 200
        assert b"10.00" in response.data

    @patch("app.routes.settings.get_stock_price", return_value=None)
    def test_stock_detail_price_fallback(self, mock_price, app, client):
        """현재가 조회 실패 시 base_price로 폴백"""
        user_uuid, _, alert_id = _create_user_and_alert(app)
        response = client.get(f"/settings/{user_uuid}/stock/{alert_id}")
        assert response.status_code == 200

    @patch("app.routes.settings.get_stock_price", side_effect=Exception("API 오류"))
    def test_stock_detail_price_exception(self, mock_price, app, client):
        """현재가 조회 예외 시 base_price로 폴백"""
        user_uuid, _, alert_id = _create_user_and_alert(app)
        response = client.get(f"/settings/{user_uuid}/stock/{alert_id}")
        assert response.status_code == 200

    @patch("app.routes.settings.get_stock_price", return_value=77000)
    def test_stock_detail_with_alert_logs(self, mock_price, app, client):
        """알림 히스토리가 있는 경우 표시"""
        user_uuid, user_id, alert_id = _create_user_and_alert(app)
        with app.app_context():
            log = AlertLog(
                alert_id=alert_id,
                user_id=user_id,
                stock_code="005930",
                base_price=70000,
                current_price=77000,
                change_rate=10.0,
                threshold_type="upper",
                email_sent=True,
            )
            db.session.add(log)
            db.session.commit()

        response = client.get(f"/settings/{user_uuid}/stock/{alert_id}")
        assert response.status_code == 200
        assert b"77,000" in response.data or b"77000" in response.data


class TestChartDataAPI:
    """차트 데이터 JSON API 테스트"""

    MOCK_PRICES = [
        {
            "date": "2026-01-02",
            "open": 68000,
            "high": 70000,
            "low": 67500,
            "close": 69000,
            "volume": 1000000,
        },
        {
            "date": "2026-01-03",
            "open": 69000,
            "high": 71000,
            "low": 68500,
            "close": 70500,
            "volume": 1200000,
        },
    ]

    @patch("app.routes.settings.get_stock_history", return_value=None)
    def _setup(self, mock_history):
        """get_stock_history가 사용되는 패턴 확인용"""
        pass

    @patch("app.routes.settings.get_stock_history")
    def test_chart_data_success(self, mock_history, app, client):
        """정상 응답: JSON 구조 확인"""
        mock_history.return_value = self.MOCK_PRICES
        user_uuid, _, alert_id = _create_user_and_alert(app)

        response = client.get(
            f"/settings/{user_uuid}/stock/{alert_id}/chart-data"
        )
        assert response.status_code == 200
        data = json.loads(response.data)

        assert "prices" in data
        assert "base_price" in data
        assert "threshold_upper" in data
        assert "threshold_lower" in data
        assert "alerts" in data
        assert len(data["prices"]) == 2
        assert data["base_price"] == 70000
        assert data["threshold_upper"] == 10.0
        assert data["threshold_lower"] == -10.0

    @patch("app.routes.settings.get_stock_history")
    def test_chart_data_price_structure(self, mock_history, app, client):
        """가격 데이터 필드 구조 확인"""
        mock_history.return_value = self.MOCK_PRICES
        user_uuid, _, alert_id = _create_user_and_alert(app)

        response = client.get(
            f"/settings/{user_uuid}/stock/{alert_id}/chart-data"
        )
        data = json.loads(response.data)
        price = data["prices"][0]

        assert price["date"] == "2026-01-02"
        assert price["open"] == 68000
        assert price["high"] == 70000
        assert price["low"] == 67500
        assert price["close"] == 69000
        assert price["volume"] == 1000000

    def test_chart_data_invalid_uuid(self, client):
        """존재하지 않는 UUID → 404"""
        response = client.get("/settings/invalid-uuid/stock/1/chart-data")
        assert response.status_code == 404

    @patch("app.routes.settings.get_stock_history")
    def test_chart_data_wrong_alert_id(self, mock_history, app, client):
        """다른 사용자의 alert_id → 404"""
        user_uuid, _, _ = _create_user_and_alert(app)
        response = client.get(
            f"/settings/{user_uuid}/stock/9999/chart-data"
        )
        assert response.status_code == 404

    @patch("app.routes.settings.get_stock_history", return_value=None)
    def test_chart_data_history_failure(self, mock_history, app, client):
        """가격 데이터 조회 실패 → 500"""
        user_uuid, _, alert_id = _create_user_and_alert(app)

        response = client.get(
            f"/settings/{user_uuid}/stock/{alert_id}/chart-data"
        )
        assert response.status_code == 500
        data = json.loads(response.data)
        assert "error" in data

    @patch("app.routes.settings.get_stock_history")
    def test_chart_data_with_alert_logs(self, mock_history, app, client):
        """알림 이력이 alerts 필드에 포함되는지 확인"""
        mock_history.return_value = self.MOCK_PRICES
        user_uuid, user_id, alert_id = _create_user_and_alert(app)

        with app.app_context():
            log = AlertLog(
                alert_id=alert_id,
                user_id=user_id,
                stock_code="005930",
                base_price=70000,
                current_price=77000,
                change_rate=10.0,
                threshold_type="upper",
                email_sent=True,
                sent_at=datetime(2026, 2, 10, 11, 30),
            )
            db.session.add(log)
            db.session.commit()

        response = client.get(
            f"/settings/{user_uuid}/stock/{alert_id}/chart-data"
        )
        data = json.loads(response.data)

        assert len(data["alerts"]) == 1
        assert data["alerts"][0]["date"] == "2026-02-10"
        assert data["alerts"][0]["price"] == 77000
        assert data["alerts"][0]["type"] == "upper"

    @patch("app.routes.settings.get_stock_history")
    def test_chart_data_empty_alert_logs(self, mock_history, app, client):
        """알림 이력이 없으면 빈 배열"""
        mock_history.return_value = self.MOCK_PRICES
        user_uuid, _, alert_id = _create_user_and_alert(app)

        response = client.get(
            f"/settings/{user_uuid}/stock/{alert_id}/chart-data"
        )
        data = json.loads(response.data)
        assert data["alerts"] == []


class TestGetStockHistory:
    """get_stock_history() 서비스 함수 테스트"""

    def _make_mock_df(self):
        """테스트용 DataFrame 생성"""
        dates = pd.to_datetime(["2026-01-02", "2026-01-03"])
        data = {
            "Open": [68000.0, 69000.0],
            "High": [70000.0, 71000.0],
            "Low": [67500.0, 68500.0],
            "Close": [69000.0, 70500.0],
            "Volume": [1000000, 1200000],
        }
        return pd.DataFrame(data, index=dates)

    @patch("FinanceDataReader.DataReader")
    def test_get_stock_history_success(self, mock_data_reader, app):
        """정상 조회: OHLCV 리스트 반환"""
        from app.services.stock import get_stock_history

        mock_data_reader.return_value = self._make_mock_df()

        with app.app_context():
            result = get_stock_history("005930", days=90)

        assert result is not None
        assert len(result) == 2
        assert result[0]["date"] == "2026-01-02"
        assert result[0]["close"] == 69000.0
        assert result[1]["volume"] == 1200000

    @patch("FinanceDataReader.DataReader")
    def test_get_stock_history_empty(self, mock_data_reader, app):
        """빈 DataFrame → None 반환"""
        from app.services.stock import get_stock_history

        mock_data_reader.return_value = pd.DataFrame()

        with app.app_context():
            result = get_stock_history("999999", days=90)

        assert result is None

    @patch("FinanceDataReader.DataReader")
    def test_get_stock_history_none(self, mock_data_reader, app):
        """None 반환 → None"""
        from app.services.stock import get_stock_history

        mock_data_reader.return_value = None

        with app.app_context():
            result = get_stock_history("999999", days=90)

        assert result is None

    @patch("FinanceDataReader.DataReader")
    def test_get_stock_history_exception(self, mock_data_reader, app):
        """예외 발생 시 None 반환"""
        from app.services.stock import get_stock_history

        mock_data_reader.side_effect = Exception("네트워크 오류")

        with app.app_context():
            result = get_stock_history("005930", days=90)

        assert result is None
