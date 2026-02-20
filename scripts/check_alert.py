#!/usr/bin/env python
"""알림 체크 스크립트

매일 평일 11:30에 cron으로 실행되어 활성 알림 조건을 체크하고,
조건 충족 시 이메일 알림을 발송합니다.

Usage:
    uv run python scripts/check_alert.py

cron 설정 예시:
    30 11 * * 1-5 cd /path/to/stock-alarm && /path/to/venv/bin/python scripts/check_alert.py
"""

import sys
from datetime import datetime
from pathlib import Path

# 프로젝트 루트를 Python 경로에 추가
project_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(project_root))

from app import create_app, db
from app.config import Config
from app.models import Alert, AlertLog
from app.services.stock import get_stock_price, get_market_summary
from app.services.llm import generate_alert_comment, get_fallback_comment
from app.services.mail import send_alert_email


def is_threshold_reached(alert: Alert, current_price: float) -> tuple[bool, str | None]:
    """
    알림 기준 충족 여부 판단

    Args:
        alert: Alert 모델 인스턴스
        current_price: 현재가

    Returns:
        tuple[bool, str | None]: (충족 여부, 기준 타입)
            - (True, "upper"): 상승 기준 충족
            - (True, "lower"): 하락 기준 충족
            - (False, None): 기준 미충족
    """
    # 변동률 계산
    change_rate = (current_price - alert.base_price) / alert.base_price * 100

    # 상승 기준 체크
    if alert.threshold_upper is not None:
        if change_rate >= alert.threshold_upper:
            return True, "upper"

    # 하락 기준 체크 (threshold_lower는 음수로 저장됨)
    if alert.threshold_lower is not None:
        if change_rate <= alert.threshold_lower:
            return True, "lower"

    return False, None


def process_alert(alert: Alert, app) -> dict:
    """
    단일 알림 처리

    Args:
        alert: Alert 모델 인스턴스
        app: Flask 앱 인스턴스

    Returns:
        dict: 처리 결과
            {
                "status": "skipped" | "not_triggered" | "triggered",
                "email_sent": bool | None,
                "error": str | None
            }
    """
    result = {"status": "skipped", "email_sent": None, "error": None}

    # 1. 현재가 조회
    current_price = get_stock_price(alert.stock_code)
    if current_price is None:
        app.logger.error(
            f"[알림 체크] 현재가 조회 실패: {alert.stock_name}({alert.stock_code})"
        )
        result["error"] = "현재가 조회 실패"
        return result

    app.logger.debug(
        f"[알림 체크] 현재가 조회: {alert.stock_code} -> {current_price:,.0f}원"
    )

    # 2. 변동률 계산
    change_rate = (current_price - alert.base_price) / alert.base_price * 100

    # 3. 기준 충족 판단
    reached, threshold_type = is_threshold_reached(alert, current_price)

    if not reached:
        result["status"] = "not_triggered"
        app.logger.debug(
            f"[알림 체크] 기준 미충족: {alert.stock_name}({alert.stock_code}), "
            f"변동률: {change_rate:+.2f}%"
        )
        return result

    # 기준 충족!
    threshold_value = (
        alert.threshold_upper if threshold_type == "upper" else alert.threshold_lower
    )
    app.logger.info(
        f"[알림 체크] 기준 충족: {alert.stock_name}({alert.stock_code}), "
        f"변동률: {change_rate:+.2f}%, 기준: {threshold_type} {threshold_value}%"
    )

    # 4. 시장 지수 조회
    market_summary = get_market_summary()
    if market_summary is None:
        app.logger.warning("[알림 체크] 시장 지수 조회 실패, 기본값 사용")
        market_summary = {
            "kospi": 0,
            "kosdaq": 0,
            "kospi_change": 0,
            "kosdaq_change": 0,
            "kospi_change_rate": 0,
            "kosdaq_change_rate": 0,
        }

    # 5. LLM 코멘트 생성
    llm_comment = generate_alert_comment(
        stock_name=alert.stock_name,
        stock_code=alert.stock_code,
        change_rate=change_rate,
        threshold_type=threshold_type,
        market_summary=market_summary,
    )
    if llm_comment is None:
        app.logger.warning("[알림 체크] LLM 코멘트 생성 실패, 폴백 코멘트 사용")
        llm_comment = get_fallback_comment(
            alert.stock_name, change_rate, threshold_type
        )

    # 6. 알림 이메일 발송
    # 설정 URL 생성
    base_url = app.config.get("BASE_URL", "https://stockalarm.co.kr")
    settings_url = f"{base_url}/settings/{alert.user.uuid}"

    email_sent = send_alert_email(
        email=alert.user.email,
        stock_name=alert.stock_name,
        stock_code=alert.stock_code,
        base_price=alert.base_price,
        current_price=current_price,
        change_rate=change_rate,
        threshold_type=threshold_type,
        threshold_value=threshold_value,
        market_summary=market_summary,
        llm_comment=llm_comment,
        settings_url=settings_url,
    )

    if email_sent:
        app.logger.info(
            f"[알림 체크] 이메일 발송 성공: {alert.user.email}, 종목: {alert.stock_name}"
        )
    else:
        app.logger.error(
            f"[알림 체크] 이메일 발송 실패: {alert.user.email}, 종목: {alert.stock_name}"
        )

    # 7. AlertLog 기록
    alert_log = AlertLog(
        alert_id=alert.id,
        user_id=alert.user_id,
        stock_code=alert.stock_code,
        base_price=alert.base_price,
        current_price=current_price,
        change_rate=change_rate,
        threshold_type=threshold_type,
        email_sent=email_sent,
        sent_at=datetime.utcnow(),
    )
    db.session.add(alert_log)

    # 8. Alert 업데이트: base_price를 현재가로 갱신, status는 active 유지
    alert.base_price = current_price

    db.session.commit()

    result["status"] = "triggered"
    result["email_sent"] = email_sent
    return result


def check_alerts() -> dict:
    """
    활성 알림 체크 및 처리

    Returns:
        dict: 처리 결과 요약
            {
                "total": 10,           # 전체 활성 알림 수
                "checked": 10,         # 체크 완료 수
                "triggered": 2,        # 기준 충족 수
                "email_sent": 2,       # 이메일 발송 성공 수
                "email_failed": 0,     # 이메일 발송 실패 수
                "errors": []           # 오류 목록
            }
    """
    app = create_app(Config)

    with app.app_context():
        # 활성 Alert 조회
        active_alerts = Alert.query.filter_by(status="active").all()

        result = {
            "total": len(active_alerts),
            "checked": 0,
            "triggered": 0,
            "email_sent": 0,
            "email_failed": 0,
            "errors": [],
        }

        app.logger.info(f"[알림 체크] 시작 - 활성 알림: {result['total']}개")

        if not active_alerts:
            app.logger.info("[알림 체크] 완료 - 활성 알림 없음")
            return result

        # 각 Alert 처리
        for alert in active_alerts:
            try:
                process_result = process_alert(alert, app)
                result["checked"] += 1

                if process_result["status"] == "triggered":
                    result["triggered"] += 1
                    if process_result["email_sent"]:
                        result["email_sent"] += 1
                    else:
                        result["email_failed"] += 1

                if process_result["error"]:
                    result["errors"].append(
                        {
                            "alert_id": alert.id,
                            "stock_code": alert.stock_code,
                            "error": process_result["error"],
                        }
                    )

            except Exception as e:
                app.logger.error(
                    f"[알림 체크] 처리 오류: {alert.stock_name}({alert.stock_code}), 오류: {e}"
                )
                result["errors"].append(
                    {
                        "alert_id": alert.id,
                        "stock_code": alert.stock_code,
                        "error": str(e),
                    }
                )

        app.logger.info(
            f"[알림 체크] 완료 - 체크: {result['checked']}, "
            f"발송: {result['triggered']}, 성공: {result['email_sent']}, "
            f"실패: {result['email_failed']}"
        )

        return result


if __name__ == "__main__":
    result = check_alerts()
    print(f"알림 체크 결과: {result}")
