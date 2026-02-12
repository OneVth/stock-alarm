"""E2E 테스트용 fixtures (서버, mock, DB)"""

import tempfile
import threading
import uuid

import pytest
from werkzeug.serving import make_server

from app import create_app, db
from app.config import Config
from app.models import User

# ── 가짜 종목 데이터 ──────────────────────────────────────────────
FAKE_STOCKS = {
    "005930": {"code": "005930", "name": "삼성전자", "market": "KOSPI", "price": 70000},
    "000660": {"code": "000660", "name": "SK하이닉스", "market": "KOSPI", "price": 120000},
    "069500": {"code": "069500", "name": "KODEX 200", "market": "ETF", "price": 35000},
    "035720": {"code": "035720", "name": "카카오", "market": "KOSPI", "price": 50000},
}


def _fake_search_stock(query, limit=10):
    """가짜 종목 검색"""
    results = []
    for stock in FAKE_STOCKS.values():
        if query.lower() in stock["name"].lower() or query in stock["code"]:
            results.append(
                {"code": stock["code"], "name": stock["name"], "market": stock["market"]}
            )
    return results[:limit]


def _fake_validate_stock_code(stock_code):
    """가짜 종목코드 검증"""
    return stock_code in FAKE_STOCKS


def _fake_get_stock_name(stock_code):
    """가짜 종목명 조회"""
    stock = FAKE_STOCKS.get(stock_code)
    return stock["name"] if stock else None


def _fake_get_stock_price(stock_code):
    """가짜 현재가 조회"""
    stock = FAKE_STOCKS.get(stock_code)
    return stock["price"] if stock else None


def _fake_send_welcome_email(email, settings_url):
    """이메일 발송 mock (항상 성공)"""
    return True


# ── E2E 테스트 설정 ───────────────────────────────────────────────
class E2ETestConfig(Config):
    """E2E 테스트 전용 설정"""

    TESTING = True
    SECRET_KEY = "e2e-test-secret"
    LOG_LEVEL = "WARNING"


# ── Fixtures ─────────────────────────────────────────────────────

@pytest.fixture(scope="session")
def e2e_app():
    """E2E 테스트용 Flask 앱 (session 스코프)"""
    # 파일 기반 SQLite (서버 스레드와 공유)
    db_file = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
    db_path = db_file.name
    db_file.close()

    E2ETestConfig.SQLALCHEMY_DATABASE_URI = f"sqlite:///{db_path}"
    E2ETestConfig.SQLALCHEMY_ENGINE_OPTIONS = {
        "connect_args": {"check_same_thread": False}
    }

    app = create_app(E2ETestConfig)

    # mock 적용 - settings.py의 top-level import
    import app.routes.settings as settings_mod

    settings_mod.validate_stock_code = _fake_validate_stock_code
    settings_mod.get_stock_name = _fake_get_stock_name
    settings_mod.get_stock_price = _fake_get_stock_price

    # mock 적용 - main.py의 top-level import
    import app.routes.main as main_mod

    main_mod.send_welcome_email = _fake_send_welcome_email

    # mock 적용 - stock service (main.py에서 함수 내부 import)
    import app.services.stock as stock_mod

    stock_mod.search_stock = _fake_search_stock
    stock_mod.validate_stock_code = _fake_validate_stock_code
    stock_mod.get_stock_name = _fake_get_stock_name
    stock_mod.get_stock_price = _fake_get_stock_price

    with app.app_context():
        db.create_all()

    yield app

    # cleanup
    import os

    try:
        os.unlink(db_path)
    except OSError:
        pass


@pytest.fixture(scope="session")
def e2e_server(e2e_app):
    """daemon thread에서 Flask 서버 실행 (session 스코프)"""
    server = make_server("127.0.0.1", 5555, e2e_app)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()

    yield "http://127.0.0.1:5555"

    server.shutdown()


@pytest.fixture(scope="session")
def base_url(e2e_server):
    """Playwright base_url fixture override"""
    return e2e_server


@pytest.fixture()
def e2e_user(e2e_app):
    """테스트 격리를 위한 사용자 생성/정리 (function 스코프)"""
    user_uuid = str(uuid.uuid4())
    user_email = f"test-{user_uuid[:8]}@example.com"

    with e2e_app.app_context():
        user = User(email=user_email, uuid=user_uuid)
        db.session.add(user)
        db.session.commit()
        user_id = user.id

    yield {"id": user_id, "email": user_email, "uuid": user_uuid}

    # cleanup
    with e2e_app.app_context():
        user = db.session.get(User, user_id)
        if user:
            db.session.delete(user)
            db.session.commit()
