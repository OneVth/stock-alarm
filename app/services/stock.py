"""주식 데이터 서비스

데이터 소스 분리:
- FinanceDataReader: 종목 리스트/검색/검증 (캐싱)
- 네이버 금융 API: 실시간 현재가/시장 지수 조회
"""

import json
import re
from datetime import date, timedelta
from pathlib import Path

import requests
from flask import current_app

# 종목코드 정규식 (6자리 숫자)
STOCK_CODE_REGEX = r"^\d{6}$"

# 네이버 금융 API 타임아웃 (초)
NAVER_API_TIMEOUT = 5


def is_valid_stock_code_format(stock_code: str) -> bool:
    """
    종목코드 형식 검증 (6자리 숫자)

    Args:
        stock_code: 검증할 종목코드

    Returns:
        bool: 형식이 올바르면 True
    """
    if not stock_code:
        return False
    return bool(re.match(STOCK_CODE_REGEX, stock_code.strip()))


# 종목 리스트 메모리 캐시
_stock_list_cache: list[dict] | None = None
_stock_list_cache_date: str | None = None


def _get_stock_list() -> list[dict]:
    """
    캐시된 종목 리스트 반환 (JSON 파일 → 메모리 캐시)

    우선순위:
        1. 메모리 캐시 (같은 날짜)
        2. JSON 파일 (data/stock_list.json)
        3. FinanceDataReader 실시간 로드 (fallback)

    Returns:
        list[dict]: 종목 리스트 [{"code": "005930", "name": "삼성전자", "market": "KOSPI"}, ...]
    """
    global _stock_list_cache, _stock_list_cache_date

    today = str(date.today())
    if _stock_list_cache is not None and _stock_list_cache_date == today:
        return _stock_list_cache

    # 1순위: JSON 파일에서 로드
    cache_path = Path(current_app.root_path).parent / "data" / "stock_list.json"
    if cache_path.exists():
        try:
            with open(cache_path, "r", encoding="utf-8") as f:
                _stock_list_cache = json.load(f)
            _stock_list_cache_date = today
            current_app.logger.info(
                f"종목 리스트 로드 완료 (JSON 파일): {len(_stock_list_cache)}개"
            )
            return _stock_list_cache
        except Exception as e:
            current_app.logger.error(f"종목 리스트 JSON 파일 로드 실패: {e}")

    # 2순위 (fallback): FinanceDataReader에서 실시간 로드
    current_app.logger.info("종목 리스트 JSON 파일 없음, FinanceDataReader로 로드 시작")
    try:
        import FinanceDataReader as fdr

        import pandas as pd

        kospi = fdr.StockListing("KOSPI")
        kosdaq = fdr.StockListing("KOSDAQ")
        etf = fdr.StockListing("ETF/KR")
        etf = etf.rename(columns={"Symbol": "Code"})

        stocks = []
        seen_codes = set()
        for df, market in [(kospi, "KOSPI"), (kosdaq, "KOSDAQ"), (etf, "ETF")]:
            for _, row in df.iterrows():
                code = str(row["Code"]).strip()
                if code and code not in seen_codes:
                    seen_codes.add(code)
                    stocks.append(
                        {
                            "code": code,
                            "name": str(row["Name"]).strip(),
                            "market": market,
                        }
                    )

        _stock_list_cache = stocks
        _stock_list_cache_date = today
        current_app.logger.info(
            f"종목 리스트 로드 완료 (FinanceDataReader): {len(stocks)}개"
        )
        return _stock_list_cache
    except Exception as e:
        current_app.logger.error(f"종목 리스트 로드 실패: {e}")
        return []


def validate_stock_code(stock_code: str) -> bool:
    """
    종목코드 유효성 검증

    Args:
        stock_code: 검증할 종목코드 (예: "005930")

    Returns:
        bool: 유효한 종목코드 여부
    """
    if not is_valid_stock_code_format(stock_code):
        current_app.logger.debug(f"종목코드 형식 오류: {stock_code}")
        return False

    stocks = _get_stock_list()
    if not stocks:
        current_app.logger.warning("종목 리스트가 비어있음")
        return False

    is_valid = any(s["code"] == stock_code.strip() for s in stocks)
    current_app.logger.debug(
        f"종목코드 검증: {stock_code} -> {'유효' if is_valid else '무효'}"
    )
    return is_valid


def search_stock(query: str, limit: int = 10) -> list[dict]:
    """
    종목 검색 (종목코드 또는 종목명으로 검색)

    Args:
        query: 검색어 (종목코드 또는 종목명 일부)
        limit: 최대 결과 수

    Returns:
        list[dict]: 검색 결과 목록
            [{"code": "005930", "name": "삼성전자", "market": "KOSPI"}, ...]
    """
    if not query:
        return []

    stocks = _get_stock_list()
    if not stocks:
        return []

    query = query.strip().lower()

    results = [
        s for s in stocks if query in s["code"].lower() or query in s["name"].lower()
    ][:limit]

    return results


def get_stock_name(stock_code: str) -> str | None:
    """
    종목명 조회 (캐시된 종목 리스트에서)

    Args:
        stock_code: 종목코드

    Returns:
        str | None: 종목명 또는 None
    """
    stocks = _get_stock_list()
    if not stocks:
        return None

    code = stock_code.strip()
    for s in stocks:
        if s["code"] == code:
            return s["name"]

    return None


def get_stock_price(stock_code: str) -> float | None:
    """
    종목의 실시간 현재가 조회 (네이버 금융 API)

    Args:
        stock_code: 종목코드 (예: "005930")

    Returns:
        float | None: 현재가 또는 None (조회 실패 시)
    """
    url = f"https://m.stock.naver.com/api/stock/{stock_code}/basic"

    current_app.logger.debug(f"[네이버 API] 현재가 조회 요청: {stock_code}")

    try:
        response = requests.get(url, timeout=NAVER_API_TIMEOUT)
        response.raise_for_status()
        data = response.json()

        # 현재가 추출 (closePrice 사용, 쉼표 제거)
        close_price = data.get("closePrice")
        if close_price is not None:
            # 문자열인 경우 쉼표 제거 후 변환
            if isinstance(close_price, str):
                close_price = close_price.replace(",", "")
            price = float(close_price)
            current_app.logger.debug(
                f"[네이버 API] 현재가 조회 성공: {stock_code} -> {price:,.0f}원"
            )
            return price

        current_app.logger.warning(f"현재가 없음: {stock_code}, 응답: {data}")
        return None

    except requests.exceptions.RequestException as e:
        current_app.logger.error(f"네이버 API 요청 실패: {stock_code}, 오류: {e}")
        return None
    except (ValueError, KeyError) as e:
        current_app.logger.error(f"네이버 API 응답 파싱 실패: {stock_code}, 오류: {e}")
        return None


def get_stock_info(stock_code: str) -> dict | None:
    """
    종목 정보 조회 (종목명 + 현재가)

    Args:
        stock_code: 종목코드 (예: "005930")

    Returns:
        dict | None: 종목 정보 또는 None
            {
                "code": "005930",
                "name": "삼성전자",
                "price": 70000.0,
                "market": "KOSPI"
            }
    """
    # 1. 종목명, 시장 조회 (캐시된 리스트)
    stocks = _get_stock_list()
    if not stocks:
        return None

    code = stock_code.strip()
    stock_data = None
    for s in stocks:
        if s["code"] == code:
            stock_data = s
            break

    if stock_data is None:
        return None

    # 2. 현재가 조회 (네이버 API)
    price = get_stock_price(stock_code)
    if price is None:
        return None

    return {
        "code": code,
        "name": stock_data["name"],
        "price": price,
        "market": stock_data["market"],
    }


def get_stock_history(stock_code: str, days: int = 90) -> list[dict] | None:
    """
    종목 과거 가격 데이터 조회 (FinanceDataReader)

    Args:
        stock_code: 종목코드 (예: "005930")
        days: 조회 기간 (일, 기본 90일)

    Returns:
        list[dict] | None: OHLCV 데이터 리스트 또는 None (조회 실패 시)
            [{"date": "2026-01-02", "open": 158000, "high": 160000,
              "low": 157500, "close": 159000, "volume": 12345678}, ...]
    """
    import FinanceDataReader as fdr

    start_date = (date.today() - timedelta(days=days)).strftime("%Y-%m-%d")

    current_app.logger.debug(
        f"[FDR] 과거 가격 조회: {stock_code}, 시작일: {start_date}"
    )

    try:
        df = fdr.DataReader(stock_code, start_date)
        if df is None or df.empty:
            current_app.logger.warning(f"[FDR] 데이터 없음: {stock_code}")
            return None

        result = []
        for idx, row in df.iterrows():
            result.append(
                {
                    "date": idx.strftime("%Y-%m-%d"),
                    "open": float(row["Open"]),
                    "high": float(row["High"]),
                    "low": float(row["Low"]),
                    "close": float(row["Close"]),
                    "volume": int(row["Volume"]),
                }
            )

        current_app.logger.info(
            f"[FDR] 과거 가격 조회 성공: {stock_code}, {len(result)}건"
        )
        return result
    except Exception as e:
        current_app.logger.error(f"[FDR] 과거 가격 조회 실패: {stock_code}, {e}")
        return None


def _parse_price(value) -> float:
    """가격 문자열을 float으로 변환 (쉼표 제거)"""
    if value is None:
        return 0.0
    if isinstance(value, str):
        return float(value.replace(",", ""))
    return float(value)


def get_market_summary() -> dict | None:
    """
    시장 지수 요약 조회 (실시간)

    Returns:
        dict | None: 시장 지수 정보 또는 None
            {
                "kospi": 2650.42,
                "kosdaq": 845.67,
                "kospi_change": 12.35,
                "kosdaq_change": -3.21,
                "kospi_change_rate": 0.47,
                "kosdaq_change_rate": -0.38
            }
    """
    current_app.logger.debug("[네이버 API] 시장 지수 조회 요청")

    try:
        kospi_url = "https://m.stock.naver.com/api/index/KOSPI/basic"
        kosdaq_url = "https://m.stock.naver.com/api/index/KOSDAQ/basic"

        kospi_resp = requests.get(kospi_url, timeout=NAVER_API_TIMEOUT)
        kosdaq_resp = requests.get(kosdaq_url, timeout=NAVER_API_TIMEOUT)

        kospi_resp.raise_for_status()
        kosdaq_resp.raise_for_status()

        kospi_data = kospi_resp.json()
        kosdaq_data = kosdaq_resp.json()

        result = {
            "kospi": _parse_price(kospi_data.get("closePrice")),
            "kosdaq": _parse_price(kosdaq_data.get("closePrice")),
            "kospi_change": _parse_price(kospi_data.get("compareToPreviousClosePrice")),
            "kosdaq_change": _parse_price(
                kosdaq_data.get("compareToPreviousClosePrice")
            ),
            "kospi_change_rate": _parse_price(kospi_data.get("fluctuationsRatio")),
            "kosdaq_change_rate": _parse_price(kosdaq_data.get("fluctuationsRatio")),
        }

        current_app.logger.debug(
            f"[네이버 API] 시장 지수 조회 성공 - "
            f"KOSPI: {result['kospi']:,.2f}, KOSDAQ: {result['kosdaq']:,.2f}"
        )
        return result

    except requests.exceptions.RequestException as e:
        current_app.logger.error(f"시장 지수 조회 실패: {e}")
        return None
    except (ValueError, KeyError) as e:
        current_app.logger.error(f"시장 지수 파싱 실패: {e}")
        return None
