#!/usr/bin/env python
"""수동 테스트 스크립트

Phase 5 알림 체크 기능을 수동으로 테스트합니다.

Usage:
    # 테스트 데이터 생성 및 알림 체크 실행
    uv run python scripts/test_manual.py --email your-email@example.com

    # 테스트 데이터만 생성
    uv run python scripts/test_manual.py --email your-email@example.com --setup-only

    # 테스트 데이터 정리
    uv run python scripts/test_manual.py --cleanup

    # 현재 상태 확인
    uv run python scripts/test_manual.py --status
"""

import argparse
import sys
import uuid
from pathlib import Path

# 프로젝트 루트를 Python 경로에 추가
project_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(project_root))

from app import create_app, db
from app.config import Config
from app.models import User, Alert, AlertLog
from app.services.stock import get_stock_price, get_stock_name


def setup_test_data(email: str, stock_code: str = "005930"):
    """테스트 데이터 생성"""
    app = create_app(Config)

    with app.app_context():
        print("=" * 50)
        print("테스트 데이터 생성")
        print("=" * 50)

        # 1. 현재가 확인
        price = get_stock_price(stock_code)
        if price is None:
            print(f"[오류] 현재가 조회 실패: {stock_code}")
            return False

        stock_name = get_stock_name(stock_code) or stock_code
        print(f"종목: {stock_name} ({stock_code})")
        print(f"현재가: {price:,.0f}원")

        # 2. 사용자 확인/생성
        user = User.query.filter_by(email=email).first()
        if not user:
            user = User(email=email, uuid=str(uuid.uuid4()))
            db.session.add(user)
            db.session.commit()
            print(f"사용자 생성: {email}")
        else:
            print(f"기존 사용자: {email}")

        # 3. 기존 테스트 알림 삭제
        existing = Alert.query.filter_by(
            user_id=user.id, stock_code=stock_code, status="active"
        ).first()
        if existing:
            print(f"기존 알림 삭제: ID {existing.id}")
            db.session.delete(existing)
            db.session.commit()

        # 4. 테스트 알림 생성 (현재가 기준 +1%로 설정 → 1% 하락 시 트리거)
        base_price = price * 1.02  # 현재가보다 2% 높게 설정
        threshold_lower = 1.0  # 1% 하락 기준

        alert = Alert(
            user_id=user.id,
            stock_code=stock_code,
            stock_name=stock_name,
            base_price=base_price,
            threshold_upper=None,
            threshold_lower=threshold_lower,
            status="active",
        )
        db.session.add(alert)
        db.session.commit()

        change_rate = (price - base_price) / base_price * 100
        print(f"\n알림 생성 완료 (ID: {alert.id})")
        print(f"  - 기준가: {base_price:,.0f}원")
        print(f"  - 현재가: {price:,.0f}원")
        print(f"  - 변동률: {change_rate:+.2f}%")
        print(f"  - 하락 기준: {threshold_lower}%")
        print(f"  - 트리거 예상: {'Yes' if change_rate <= -threshold_lower else 'No'}")

        return True


def run_check():
    """알림 체크 실행"""
    print("\n" + "=" * 50)
    print("알림 체크 실행")
    print("=" * 50)

    from scripts.check_alert import check_alerts

    result = check_alerts()

    print(f"\n결과:")
    print(f"  - 전체 알림: {result['total']}개")
    print(f"  - 체크 완료: {result['checked']}개")
    print(f"  - 기준 충족: {result['triggered']}개")
    print(f"  - 이메일 성공: {result['email_sent']}개")
    print(f"  - 이메일 실패: {result['email_failed']}개")

    if result["errors"]:
        print(f"  - 오류: {result['errors']}")

    return result


def show_status():
    """현재 상태 확인"""
    app = create_app(Config)

    with app.app_context():
        print("=" * 50)
        print("현재 상태")
        print("=" * 50)

        # 사용자
        users = User.query.all()
        print(f"\n사용자: {len(users)}명")
        for u in users:
            print(f"  - {u.email} (UUID: {u.uuid[:8]}...)")

        # 알림
        alerts = Alert.query.all()
        print(f"\n알림: {len(alerts)}개")
        for a in alerts:
            print(
                f"  - [{a.status}] {a.stock_name}({a.stock_code}), "
                f"기준가: {a.base_price:,.0f}원, "
                f"상승: {a.threshold_upper or '-'}%, 하락: {a.threshold_lower or '-'}%"
            )
            if a.triggered_at:
                print(f"    트리거: {a.triggered_at}")

        # 알림 로그
        logs = AlertLog.query.order_by(AlertLog.sent_at.desc()).limit(10).all()
        print(f"\n최근 알림 로그: {len(logs)}개")
        for log in logs:
            print(
                f"  - {log.stock_code}, 변동률: {log.change_rate:+.2f}%, "
                f"이메일: {'성공' if log.email_sent else '실패'}, "
                f"시간: {log.sent_at}"
            )


def cleanup():
    """테스트 데이터 정리"""
    app = create_app(Config)

    with app.app_context():
        print("=" * 50)
        print("테스트 데이터 정리")
        print("=" * 50)

        # triggered 상태 알림 삭제
        triggered_alerts = Alert.query.filter_by(status="triggered").all()
        for alert in triggered_alerts:
            # 관련 로그 삭제
            AlertLog.query.filter_by(alert_id=alert.id).delete()
            db.session.delete(alert)

        db.session.commit()
        print(f"삭제된 알림: {len(triggered_alerts)}개")


def main():
    parser = argparse.ArgumentParser(description="Phase 5 수동 테스트")
    parser.add_argument("--email", type=str, help="테스트용 이메일 주소")
    parser.add_argument(
        "--stock", type=str, default="005930", help="테스트 종목코드 (기본: 005930)"
    )
    parser.add_argument(
        "--setup-only", action="store_true", help="데이터 생성만 (알림 체크 미실행)"
    )
    parser.add_argument("--cleanup", action="store_true", help="테스트 데이터 정리")
    parser.add_argument("--status", action="store_true", help="현재 상태 확인")

    args = parser.parse_args()

    if args.status:
        show_status()
        return

    if args.cleanup:
        cleanup()
        return

    if not args.email:
        parser.error("--email 옵션이 필요합니다")

    # 테스트 데이터 생성
    if not setup_test_data(args.email, args.stock):
        sys.exit(1)

    # 알림 체크 실행
    if not args.setup_only:
        run_check()
        print("\n" + "=" * 50)
        show_status()


if __name__ == "__main__":
    main()
