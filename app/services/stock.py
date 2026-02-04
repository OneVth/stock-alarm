"""주식 데이터 서비스

데이터 소스 분리:
- FinanceDataReader: 종목 리스트/검색/검증 (캐싱)
- 네이버 금융 API: 실시간 현재가/시장 지수 조회
"""

import re
from datetime import date
from functools import lru_cache

import pandas as pd
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


@lru_cache(maxsize=1)
def _get_stock_list_cached(cache_date: str) -> pd.DataFrame:
    """
    종목 리스트 캐싱 (하루 1회 갱신)

    Args:
        cache_date: 캐시 키 (날짜 문자열)

    Returns:
        pd.DataFrame: KOSPI + KOSDAQ 전체 종목 DataFrame
    """
    import FinanceDataReader as fdr

    try:
        kospi = fdr.StockListing("KOSPI")
        kosdaq = fdr.StockListing("KOSDAQ")

        kospi["Market"] = "KOSPI"
        kosdaq["Market"] = "KOSDAQ"

        combined = pd.concat([kospi, kosdaq], ignore_index=True)
        current_app.logger.info(f"종목 리스트 로드 완료: {len(combined)}개")
        return combined
    except Exception as e:
        current_app.logger.error(f"종목 리스트 로드 실패: {e}")
        return pd.DataFrame()


def _get_stock_list() -> pd.DataFrame:
    """
    캐시된 종목 리스트 반환

    Returns:
        pd.DataFrame: 종목 리스트 (Code, Name, Market 등)
    """
    return _get_stock_list_cached(str(date.today()))


def validate_stock_code(stock_code: str) -> bool:
    """
    종목코드 유효성 검증

    Args:
        stock_code: 검증할 종목코드 (예: "005930")

    Returns:
        bool: 유효한 종목코드 여부
    """
    if not is_valid_stock_code_format(stock_code):
        return False

    df = _get_stock_list()
    if df.empty:
        return False

    return stock_code.strip() in df["Code"].values


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

    df = _get_stock_list()
    if df.empty:
        return []

    query = query.strip()

    # 종목코드 또는 종목명으로 검색
    mask = df["Code"].str.contains(query, case=False, na=False) | df[
        "Name"
    ].str.contains(query, case=False, na=False)

    results = df[mask].head(limit)

    return [
        {"code": row["Code"], "name": row["Name"], "market": row["Market"]}
        for _, row in results.iterrows()
    ]


def get_stock_name(stock_code: str) -> str | None:
    """
    종목명 조회 (캐시된 종목 리스트에서)

    Args:
        stock_code: 종목코드

    Returns:
        str | None: 종목명 또는 None
    """
    df = _get_stock_list()
    if df.empty:
        return None

    stock_row = df[df["Code"] == stock_code.strip()]
    if stock_row.empty:
        return None

    return stock_row.iloc[0]["Name"]


def get_stock_price(stock_code: str) -> float | None:
    """
    종목의 실시간 현재가 조회 (네이버 금융 API)

    Args:
        stock_code: 종목코드 (예: "005930")

    Returns:
        float | None: 현재가 또는 None (조회 실패 시)
    """
    url = f"https://m.stock.naver.com/api/stock/{stock_code}/basic"

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
            return float(close_price)

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
    df = _get_stock_list()
    if df.empty:
        return None

    stock_row = df[df["Code"] == stock_code.strip()]
    if stock_row.empty:
        return None

    stock_name = stock_row.iloc[0]["Name"]
    market = stock_row.iloc[0]["Market"]

    # 2. 현재가 조회 (네이버 API)
    price = get_stock_price(stock_code)
    if price is None:
        return None

    return {
        "code": stock_code.strip(),
        "name": stock_name,
        "price": price,
        "market": market,
    }


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
    try:
        kospi_url = "https://m.stock.naver.com/api/index/KOSPI/basic"
        kosdaq_url = "https://m.stock.naver.com/api/index/KOSDAQ/basic"

        kospi_resp = requests.get(kospi_url, timeout=NAVER_API_TIMEOUT)
        kosdaq_resp = requests.get(kosdaq_url, timeout=NAVER_API_TIMEOUT)

        kospi_resp.raise_for_status()
        kosdaq_resp.raise_for_status()

        kospi_data = kospi_resp.json()
        kosdaq_data = kosdaq_resp.json()

        return {
            "kospi": _parse_price(kospi_data.get("closePrice")),
            "kosdaq": _parse_price(kosdaq_data.get("closePrice")),
            "kospi_change": _parse_price(kospi_data.get("compareToPreviousClosePrice")),
            "kosdaq_change": _parse_price(kosdaq_data.get("compareToPreviousClosePrice")),
            "kospi_change_rate": _parse_price(kospi_data.get("fluctuationsRatio")),
            "kosdaq_change_rate": _parse_price(kosdaq_data.get("fluctuationsRatio")),
        }

    except requests.exceptions.RequestException as e:
        current_app.logger.error(f"시장 지수 조회 실패: {e}")
        return None
    except (ValueError, KeyError) as e:
        current_app.logger.error(f"시장 지수 파싱 실패: {e}")
        return None
