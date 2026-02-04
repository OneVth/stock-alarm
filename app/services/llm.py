"""LLM 서비스 (OpenAI API 연동)

알림 이메일에 포함할 투자 코멘트 생성
"""

import time
from pathlib import Path

from flask import current_app
from openai import OpenAI, APIConnectionError, RateLimitError, APIStatusError, AuthenticationError

# OpenAI API 설정
OPENAI_MODEL = "gpt-5-nano"
OPENAI_MAX_TOKENS = 300
OPENAI_TEMPERATURE = 0.7
OPENAI_TIMEOUT = 30  # 초

# 재시도 설정
MAX_RETRIES = 3
BASE_RETRY_DELAY = 1  # 초

# 프롬프트 경로
PROMPT_TEMPLATE_PATH = Path(__file__).resolve().parent.parent.parent / "prompts" / "alert_mail.txt"

# 기본 프롬프트 (템플릿 파일이 없을 경우 사용)
DEFAULT_PROMPT_TEMPLATE = """당신은 주식 시장 분석가입니다.
다음 정보를 바탕으로 간결한 투자 코멘트를 작성하세요.

종목: {stock_name} ({stock_code})
변동률: {change_rate}%
기준: {threshold_direction}
코스피: {kospi}, 코스닥: {kosdaq}

요구사항: 3-5문장, 객관적 사실 위주, 투자 권유 금지, 한국어
"""


def load_prompt_template() -> str:
    """
    프롬프트 템플릿 파일 로드

    Returns:
        str: 프롬프트 템플릿 문자열

    Note:
        템플릿 파일이 없을 경우 기본 프롬프트 반환
    """
    try:
        with open(PROMPT_TEMPLATE_PATH, "r", encoding="utf-8") as f:
            template = f.read()
            current_app.logger.debug(f"[LLM] 프롬프트 템플릿 로드: {PROMPT_TEMPLATE_PATH}")
            return template
    except FileNotFoundError:
        current_app.logger.warning(
            f"[LLM] 프롬프트 템플릿 파일 없음, 기본 프롬프트 사용: {PROMPT_TEMPLATE_PATH}"
        )
        return DEFAULT_PROMPT_TEMPLATE


def get_fallback_comment(stock_name: str, change_rate: float, threshold_type: str) -> str:
    """
    API 실패 시 사용할 기본 코멘트 생성

    Args:
        stock_name: 종목명
        change_rate: 변동률 (%)
        threshold_type: "upper" 또는 "lower"

    Returns:
        str: 폴백 코멘트
    """
    direction = "상승" if threshold_type == "upper" else "하락"
    return (
        f"{stock_name}이(가) 등록가 대비 {abs(change_rate):.2f}% {direction}하여 "
        f"설정하신 {direction} 기준에 도달했습니다."
    )


def _format_prompt(
    stock_name: str,
    stock_code: str,
    change_rate: float,
    threshold_type: str,
    market_summary: dict,
) -> str:
    """
    프롬프트 템플릿에 변수 대입

    Args:
        stock_name: 종목명
        stock_code: 종목코드
        change_rate: 변동률 (%)
        threshold_type: "upper" 또는 "lower"
        market_summary: 시장 지수 정보

    Returns:
        str: 포맷팅된 프롬프트
    """
    template = load_prompt_template()

    threshold_direction = "상승" if threshold_type == "upper" else "하락"

    # market_summary에서 값 추출 (기본값 설정)
    kospi = market_summary.get("kospi", 0)
    kosdaq = market_summary.get("kosdaq", 0)
    kospi_change = market_summary.get("kospi_change", 0)
    kosdaq_change = market_summary.get("kosdaq_change", 0)
    kospi_change_rate = market_summary.get("kospi_change_rate", 0)
    kosdaq_change_rate = market_summary.get("kosdaq_change_rate", 0)

    # 포맷팅
    return template.format(
        stock_name=stock_name,
        stock_code=stock_code,
        change_rate=f"{change_rate:+.2f}",
        threshold_direction=threshold_direction,
        kospi=f"{kospi:,.2f}",
        kospi_change=f"{kospi_change:+.2f}",
        kospi_change_rate=f"{kospi_change_rate:+.2f}",
        kosdaq=f"{kosdaq:,.2f}",
        kosdaq_change=f"{kosdaq_change:+.2f}",
        kosdaq_change_rate=f"{kosdaq_change_rate:+.2f}",
    )


def generate_alert_comment(
    stock_name: str,
    stock_code: str,
    change_rate: float,
    threshold_type: str,
    market_summary: dict,
) -> str | None:
    """
    알림 이메일에 포함할 투자 코멘트 생성

    Args:
        stock_name: 종목명 (예: "삼성전자")
        stock_code: 종목코드 (예: "005930")
        change_rate: 등록가 대비 변동률 (%) (예: 5.23 또는 -3.15)
        threshold_type: 도달 기준 타입 ("upper" 또는 "lower")
        market_summary: 시장 지수 정보 dict
            {
                "kospi": 2650.42,
                "kosdaq": 845.67,
                "kospi_change": 12.35,
                "kosdaq_change": -3.21,
                "kospi_change_rate": 0.47,
                "kosdaq_change_rate": -0.38
            }

    Returns:
        str | None: 생성된 투자 코멘트 (3-5문장) 또는 None (API 호출 실패 시)
    """
    # 1. API 키 확인
    api_key = current_app.config.get("OPENAI_API_KEY")
    if not api_key:
        current_app.logger.error("[LLM] OPENAI_API_KEY가 설정되지 않았습니다.")
        return None

    # 2. 프롬프트 생성
    prompt = _format_prompt(
        stock_name, stock_code, change_rate, threshold_type, market_summary
    )

    current_app.logger.debug(f"[LLM] 코멘트 생성 요청: {stock_name}({stock_code})")

    # 3. OpenAI API 호출 (재시도 로직 포함)
    client = OpenAI(api_key=api_key, timeout=OPENAI_TIMEOUT)

    for attempt in range(MAX_RETRIES):
        try:
            response = client.chat.completions.create(
                model=OPENAI_MODEL,
                messages=[
                    {
                        "role": "system",
                        "content": "당신은 주식 시장 분석가입니다. 객관적이고 간결하게 답변하세요.",
                    },
                    {"role": "user", "content": prompt},
                ],
                max_tokens=OPENAI_MAX_TOKENS,
                temperature=OPENAI_TEMPERATURE,
            )

            # 성공
            content = response.choices[0].message.content
            total_tokens = response.usage.total_tokens if response.usage else 0

            current_app.logger.info(
                f"[LLM] 코멘트 생성 성공: {stock_name}({stock_code}), 토큰: {total_tokens}"
            )
            return content

        except AuthenticationError as e:
            # 인증 오류는 재시도 불필요
            current_app.logger.error(f"[LLM] API 인증 오류: {e}")
            return None

        except (APIConnectionError, RateLimitError, APIStatusError) as e:
            # 재시도 가능한 오류
            if attempt == MAX_RETRIES - 1:
                # 최종 실패
                current_app.logger.error(
                    f"[LLM] API 호출 실패 (최종), 폴백 코멘트 사용: "
                    f"{stock_name}({stock_code}), 오류: {e}"
                )
                return get_fallback_comment(stock_name, change_rate, threshold_type)

            # 재시도 대기 (지수 백오프)
            delay = BASE_RETRY_DELAY * (2**attempt)
            current_app.logger.warning(
                f"[LLM] API 재시도 ({attempt + 1}/{MAX_RETRIES}), "
                f"{delay}초 후: {e}"
            )
            time.sleep(delay)

        except Exception as e:
            # 예상치 못한 오류
            current_app.logger.error(
                f"[LLM] 예상치 못한 오류, 폴백 코멘트 사용: "
                f"{stock_name}({stock_code}), 오류: {e}"
            )
            return get_fallback_comment(stock_name, change_rate, threshold_type)

    # 모든 재시도 실패 (이론적으로 도달 불가)
    return get_fallback_comment(stock_name, change_rate, threshold_type)
