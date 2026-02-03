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
