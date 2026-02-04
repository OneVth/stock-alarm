"""이메일 발송 서비스"""

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from flask import current_app


def send_welcome_email(email: str, settings_url: str) -> bool:
    """
    환영 이메일 발송

    Args:
        email: 수신자 이메일 주소
        settings_url: 설정 페이지 전체 URL
                      예: https://stockalarm.co.kr/settings/abc-123-def

    Returns:
        bool: 발송 성공 여부
              True - 발송 성공
              False - 발송 실패
    """
    gmail_address = current_app.config.get("GMAIL_ADDRESS")
    gmail_password = current_app.config.get("GMAIL_APP_PASSWORD")

    if not gmail_address or not gmail_password:
        current_app.logger.error("Gmail 설정이 없습니다.")
        return False

    subject = "[Stock Alarm] 설정 페이지 안내"
    body = f"""Stock Alarm 서비스에 등록해 주셔서 감사합니다.

아래 링크에서 알림을 받고 싶은 종목을 설정하세요:
{settings_url}

이 링크는 본인만 사용할 수 있는 고유 URL입니다.
분실 시 홈페이지에서 동일한 이메일로 재발급 받을 수 있습니다.

---
Stock Alarm 서비스
"""

    try:
        msg = MIMEMultipart()
        msg["From"] = gmail_address
        msg["To"] = email
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "plain", "utf-8"))

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(gmail_address, gmail_password)
            server.sendmail(gmail_address, email, msg.as_string())

        current_app.logger.info(f"환영 이메일 발송 완료: {email}")
        return True

    except Exception as e:
        current_app.logger.error(f"이메일 발송 실패: {email}, 오류: {e}")
        return False


def send_alert_email(
    email: str,
    stock_name: str,
    stock_code: str,
    base_price: float,
    current_price: float,
    change_rate: float,
    threshold_type: str,
    threshold_value: float,
    market_summary: dict,
    llm_comment: str,
    settings_url: str,
) -> bool:
    """
    알림 이메일 발송

    Args:
        email: 수신자 이메일 주소
        stock_name: 종목명
        stock_code: 종목코드
        base_price: 등록 시점 기준가
        current_price: 현재가
        change_rate: 변동률 (%)
        threshold_type: 기준 타입 ("upper" 또는 "lower")
        threshold_value: 설정된 기준값 (%)
        market_summary: 시장 지수 정보
        llm_comment: LLM 생성 투자 코멘트
        settings_url: 설정 페이지 URL

    Returns:
        bool: 발송 성공 여부
    """
    gmail_address = current_app.config.get("GMAIL_ADDRESS")
    gmail_password = current_app.config.get("GMAIL_APP_PASSWORD")

    if not gmail_address or not gmail_password:
        current_app.logger.error("[알림 이메일] Gmail 설정이 없습니다.")
        return False

    # 이메일 제목
    direction = "상승" if threshold_type == "upper" else "하락"
    subject = f"[Stock Alarm] {stock_name} {direction} 기준 도달"

    # 시장 지수 정보 추출 (기본값 설정)
    kospi = market_summary.get("kospi", 0)
    kosdaq = market_summary.get("kosdaq", 0)
    kospi_change = market_summary.get("kospi_change", 0)
    kosdaq_change = market_summary.get("kosdaq_change", 0)
    kospi_change_rate = market_summary.get("kospi_change_rate", 0)
    kosdaq_change_rate = market_summary.get("kosdaq_change_rate", 0)

    # 이메일 본문
    body = f"""## 알림 요약

- 종목: {stock_name} ({stock_code})
- 등록가: {base_price:,.0f}원
- 현재가: {current_price:,.0f}원
- 변동률: {change_rate:+.2f}%
- 도달 기준: {direction} {threshold_value}%

## 시장 동향

- 코스피: {kospi:,.2f} ({kospi_change:+.2f}, {kospi_change_rate:+.2f}%)
- 코스닥: {kosdaq:,.2f} ({kosdaq_change:+.2f}, {kosdaq_change_rate:+.2f}%)

## 투자 코멘트

{llm_comment}

---
이 알림은 Stock Alarm 서비스에서 발송되었습니다.
설정 변경: {settings_url}
"""

    try:
        msg = MIMEMultipart()
        msg["From"] = gmail_address
        msg["To"] = email
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "plain", "utf-8"))

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(gmail_address, gmail_password)
            server.sendmail(gmail_address, email, msg.as_string())

        current_app.logger.info(
            f"[알림 이메일] 발송 성공: {email}, 종목: {stock_name}({stock_code})"
        )
        return True

    except Exception as e:
        current_app.logger.error(
            f"[알림 이메일] 발송 실패: {email}, 종목: {stock_name}({stock_code}), 오류: {e}"
        )
        return False
