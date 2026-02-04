"""Phase 3: 종목 관리 및 알림 설정 테스트"""

import uuid
from unittest.mock import patch, MagicMock

import pandas as pd
import pytest

from app import db
from app.models import User, Alert
from app.services.stock import (
    is_valid_stock_code_format,
    validate_stock_code,
    search_stock,
    get_stock_name,
    get_stock_price,
    get_stock_info,
    get_market_summary,
)

# ============================================================
# 종목코드 형식 검증 테스트
# ============================================================


class TestStockCodeFormat:
    """종목코드 형식 검증 테스트"""

    def test_valid_stock_code_format(self):
        """유효한 종목코드 형식"""
        assert is_valid_stock_code_format("005930") is True
        assert is_valid_stock_code_format("000660") is True
        assert is_valid_stock_code_format("123456") is True

    def test_invalid_stock_code_format_empty(self):
        """빈 종목코드"""
        assert is_valid_stock_code_format("") is False
        assert is_valid_stock_code_format(None) is False

    def test_invalid_stock_code_format_wrong_length(self):
        """잘못된 길이"""
        assert is_valid_stock_code_format("12345") is False
        assert is_valid_stock_code_format("1234567") is False

    def test_invalid_stock_code_format_non_numeric(self):
        """숫자가 아닌 문자"""
        assert is_valid_stock_code_format("00593A") is False
        assert is_valid_stock_code_format("ABCDEF") is False


# ============================================================
# 종목 리스트/검증 테스트 (Mock)
# ============================================================


@pytest.fixture
def mock_stock_list():
    """Mock 종목 리스트"""
    return pd.DataFrame(
        {
            "Code": ["005930", "000660", "035720"],
            "Name": ["삼성전자", "SK하이닉스", "카카오"],
            "Market": ["KOSPI", "KOSPI", "KOSPI"],
        }
    )


class TestValidateStockCode:
    """종목코드 유효성 검증 테스트"""

    @patch("app.services.stock._get_stock_list")
    def test_valid_stock_code(self, mock_get_list, app, mock_stock_list):
        """유효한 종목코드"""
        mock_get_list.return_value = mock_stock_list

        with app.app_context():
            assert validate_stock_code("005930") is True
            assert validate_stock_code("000660") is True

    @patch("app.services.stock._get_stock_list")
    def test_invalid_stock_code_not_in_list(self, mock_get_list, app, mock_stock_list):
        """리스트에 없는 종목코드"""
        mock_get_list.return_value = mock_stock_list

        with app.app_context():
            assert validate_stock_code("999999") is False

    @patch("app.services.stock._get_stock_list")
    def test_invalid_stock_code_wrong_format(self, mock_get_list, app, mock_stock_list):
        """잘못된 형식"""
        mock_get_list.return_value = mock_stock_list

        with app.app_context():
            assert validate_stock_code("12345") is False
            assert validate_stock_code("") is False


class TestSearchStock:
    """종목 검색 테스트"""

    @patch("app.services.stock._get_stock_list")
    def test_search_by_code(self, mock_get_list, app, mock_stock_list):
        """종목코드로 검색"""
        mock_get_list.return_value = mock_stock_list

        with app.app_context():
            results = search_stock("005930")
            assert len(results) == 1
            assert results[0]["code"] == "005930"
            assert results[0]["name"] == "삼성전자"

    @patch("app.services.stock._get_stock_list")
    def test_search_by_name(self, mock_get_list, app, mock_stock_list):
        """종목명으로 검색"""
        mock_get_list.return_value = mock_stock_list

        with app.app_context():
            results = search_stock("삼성")
            assert len(results) == 1
            assert results[0]["name"] == "삼성전자"

    @patch("app.services.stock._get_stock_list")
    def test_search_empty_query(self, mock_get_list, app, mock_stock_list):
        """빈 검색어"""
        mock_get_list.return_value = mock_stock_list

        with app.app_context():
            results = search_stock("")
            assert results == []


class TestGetStockName:
    """종목명 조회 테스트"""

    @patch("app.services.stock._get_stock_list")
    def test_get_stock_name_success(self, mock_get_list, app, mock_stock_list):
        """종목명 조회 성공"""
        mock_get_list.return_value = mock_stock_list

        with app.app_context():
            assert get_stock_name("005930") == "삼성전자"
            assert get_stock_name("000660") == "SK하이닉스"

    @patch("app.services.stock._get_stock_list")
    def test_get_stock_name_not_found(self, mock_get_list, app, mock_stock_list):
        """종목명 조회 실패"""
        mock_get_list.return_value = mock_stock_list

        with app.app_context():
            assert get_stock_name("999999") is None


# ============================================================
# 네이버 API 테스트 (Mock)
# ============================================================


class TestGetStockPrice:
    """현재가 조회 테스트"""

    @patch("app.services.stock.requests.get")
    def test_get_stock_price_success(self, mock_get, app):
        """현재가 조회 성공"""
        mock_response = MagicMock()
        # 실제 네이버 API 응답 형식: closePrice가 쉼표 포함 문자열
        mock_response.json.return_value = {"closePrice": "70,000"}
        mock_response.raise_for_status = MagicMock()
        mock_get.return_value = mock_response

        with app.app_context():
            price = get_stock_price("005930")
            assert price == 70000.0

    @patch("app.services.stock.requests.get")
    def test_get_stock_price_numeric(self, mock_get, app):
        """현재가 조회 성공 (숫자 형식)"""
        mock_response = MagicMock()
        mock_response.json.return_value = {"closePrice": 70000}
        mock_response.raise_for_status = MagicMock()
        mock_get.return_value = mock_response

        with app.app_context():
            price = get_stock_price("005930")
            assert price == 70000.0

    @patch("app.services.stock.requests.get")
    def test_get_stock_price_api_error(self, mock_get, app):
        """API 오류 시 None 반환"""
        import requests

        mock_get.side_effect = requests.exceptions.RequestException("Connection error")

        with app.app_context():
            price = get_stock_price("005930")
            assert price is None


class TestGetMarketSummary:
    """시장 지수 조회 테스트"""

    @patch("app.services.stock.requests.get")
    def test_get_market_summary_success(self, mock_get, app):
        """시장 지수 조회 성공"""

        def mock_response_factory(url, **kwargs):
            mock_resp = MagicMock()
            mock_resp.raise_for_status = MagicMock()
            if "KOSPI" in url:
                mock_resp.json.return_value = {
                    "closePrice": 2650.42,
                    "compareToPreviousClosePrice": 12.35,
                    "fluctuationsRatio": 0.47,
                }
            else:
                mock_resp.json.return_value = {
                    "closePrice": 845.67,
                    "compareToPreviousClosePrice": -3.21,
                    "fluctuationsRatio": -0.38,
                }
            return mock_resp

        mock_get.side_effect = mock_response_factory

        with app.app_context():
            summary = get_market_summary()
            assert summary is not None
            assert summary["kospi"] == 2650.42
            assert summary["kosdaq"] == 845.67


# ============================================================
# 설정 페이지 라우트 테스트
# ============================================================


class TestSettingsPage:
    """설정 페이지 테스트"""

    def test_settings_page_with_valid_uuid(self, app, client):
        """유효한 UUID로 설정 페이지 접근"""
        with app.app_context():
            user = User(email="test@example.com", uuid=str(uuid.uuid4()))
            db.session.add(user)
            db.session.commit()
            user_uuid = user.uuid

        response = client.get(f"/settings/{user_uuid}")
        assert response.status_code == 200
        assert b"test@example.com" in response.data

    def test_settings_page_with_invalid_uuid(self, client):
        """유효하지 않은 UUID로 설정 페이지 접근"""
        response = client.get("/settings/invalid-uuid")
        assert response.status_code == 404


# ============================================================
# 종목 추가 라우트 테스트
# ============================================================


class TestAddAlert:
    """종목 추가 테스트"""

    def test_add_alert_empty_stock_code(self, app, client):
        """빈 종목코드로 추가 시 에러"""
        with app.app_context():
            user = User(email="test@example.com", uuid=str(uuid.uuid4()))
            db.session.add(user)
            db.session.commit()
            user_uuid = user.uuid

        response = client.post(
            f"/settings/{user_uuid}/alerts",
            data={"stock_code": "", "threshold_upper": "10"},
            follow_redirects=True,
        )
        assert response.status_code == 200
        assert "종목코드를 입력해주세요".encode("utf-8") in response.data

    def test_add_alert_invalid_format(self, app, client):
        """잘못된 형식의 종목코드"""
        with app.app_context():
            user = User(email="test@example.com", uuid=str(uuid.uuid4()))
            db.session.add(user)
            db.session.commit()
            user_uuid = user.uuid

        response = client.post(
            f"/settings/{user_uuid}/alerts",
            data={"stock_code": "12345", "threshold_upper": "10"},
            follow_redirects=True,
        )
        assert response.status_code == 200
        assert "종목코드는 6자리 숫자여야 합니다".encode("utf-8") in response.data

    def test_add_alert_no_threshold(self, app, client):
        """알림 기준 없이 추가 시 에러"""
        with app.app_context():
            user = User(email="test@example.com", uuid=str(uuid.uuid4()))
            db.session.add(user)
            db.session.commit()
            user_uuid = user.uuid

        response = client.post(
            f"/settings/{user_uuid}/alerts",
            data={"stock_code": "005930"},
            follow_redirects=True,
        )
        assert response.status_code == 200
        assert (
            "상승 또는 하락 기준 중 하나 이상을 입력해주세요".encode("utf-8")
            in response.data
        )

    @patch("app.routes.settings.validate_stock_code")
    def test_add_alert_invalid_stock_code(self, mock_validate, app, client):
        """유효하지 않은 종목코드"""
        mock_validate.return_value = False

        with app.app_context():
            user = User(email="test@example.com", uuid=str(uuid.uuid4()))
            db.session.add(user)
            db.session.commit()
            user_uuid = user.uuid

        response = client.post(
            f"/settings/{user_uuid}/alerts",
            data={"stock_code": "999999", "threshold_upper": "10"},
            follow_redirects=True,
        )
        assert response.status_code == 200
        assert "유효하지 않은 종목코드입니다".encode("utf-8") in response.data

    @patch("app.routes.settings.get_stock_price")
    @patch("app.routes.settings.get_stock_name")
    @patch("app.routes.settings.validate_stock_code")
    def test_add_alert_success(
        self, mock_validate, mock_get_name, mock_get_price, app, client
    ):
        """종목 추가 성공"""
        mock_validate.return_value = True
        mock_get_name.return_value = "삼성전자"
        mock_get_price.return_value = 70000.0

        with app.app_context():
            user = User(email="test@example.com", uuid=str(uuid.uuid4()))
            db.session.add(user)
            db.session.commit()
            user_uuid = user.uuid
            user_id = user.id

        response = client.post(
            f"/settings/{user_uuid}/alerts",
            data={
                "stock_code": "005930",
                "threshold_upper": "10",
                "threshold_lower": "-10",
            },
            follow_redirects=True,
        )
        assert response.status_code == 200
        assert (
            "삼성전자 (005930) 종목이 추가되었습니다".encode("utf-8") in response.data
        )

        # DB 확인
        with app.app_context():
            alert = Alert.query.filter_by(user_id=user_id, stock_code="005930").first()
            assert alert is not None
            assert alert.stock_name == "삼성전자"
            assert alert.base_price == 70000.0
            assert alert.threshold_upper == 10.0
            assert alert.threshold_lower == -10.0
            assert alert.status == "active"

    @patch("app.routes.settings.get_stock_price")
    @patch("app.routes.settings.get_stock_name")
    @patch("app.routes.settings.validate_stock_code")
    def test_add_alert_duplicate(
        self, mock_validate, mock_get_name, mock_get_price, app, client
    ):
        """중복 종목 추가 시 에러"""
        mock_validate.return_value = True
        mock_get_name.return_value = "삼성전자"
        mock_get_price.return_value = 70000.0

        with app.app_context():
            user = User(email="test@example.com", uuid=str(uuid.uuid4()))
            db.session.add(user)
            db.session.commit()

            # 기존 Alert 추가
            alert = Alert(
                user_id=user.id,
                stock_code="005930",
                stock_name="삼성전자",
                base_price=70000.0,
                threshold_upper=10.0,
                status="active",
            )
            db.session.add(alert)
            db.session.commit()
            user_uuid = user.uuid

        response = client.post(
            f"/settings/{user_uuid}/alerts",
            data={"stock_code": "005930", "threshold_upper": "10"},
            follow_redirects=True,
        )
        assert response.status_code == 200
        assert "이미 등록된 종목입니다".encode("utf-8") in response.data


# ============================================================
# 종목 삭제 라우트 테스트
# ============================================================


class TestDeleteAlert:
    """종목 삭제 테스트"""

    def test_delete_alert_success(self, app, client):
        """종목 삭제 성공"""
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
                status="active",
            )
            db.session.add(alert)
            db.session.commit()

            user_uuid = user.uuid
            alert_id = alert.id

        response = client.post(
            f"/settings/{user_uuid}/alerts/{alert_id}/delete",
            follow_redirects=True,
        )
        assert response.status_code == 200
        assert (
            "삼성전자 (005930) 종목이 삭제되었습니다".encode("utf-8") in response.data
        )

        # DB 확인
        with app.app_context():
            alert = db.session.get(Alert, alert_id)
            assert alert is None

    def test_delete_alert_not_found(self, app, client):
        """존재하지 않는 Alert 삭제"""
        with app.app_context():
            user = User(email="test@example.com", uuid=str(uuid.uuid4()))
            db.session.add(user)
            db.session.commit()
            user_uuid = user.uuid

        response = client.post(
            f"/settings/{user_uuid}/alerts/9999/delete",
            follow_redirects=False,
        )
        assert response.status_code == 404

    def test_delete_alert_wrong_user(self, app, client):
        """다른 사용자의 Alert 삭제 시도"""
        with app.app_context():
            user1 = User(email="user1@example.com", uuid=str(uuid.uuid4()))
            user2 = User(email="user2@example.com", uuid=str(uuid.uuid4()))
            db.session.add_all([user1, user2])
            db.session.commit()

            # user1의 Alert
            alert = Alert(
                user_id=user1.id,
                stock_code="005930",
                stock_name="삼성전자",
                base_price=70000.0,
                threshold_upper=10.0,
                status="active",
            )
            db.session.add(alert)
            db.session.commit()

            user2_uuid = user2.uuid
            alert_id = alert.id

        # user2가 user1의 Alert 삭제 시도
        response = client.post(
            f"/settings/{user2_uuid}/alerts/{alert_id}/delete",
            follow_redirects=False,
        )
        assert response.status_code == 403
