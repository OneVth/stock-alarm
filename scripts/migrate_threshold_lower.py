#!/usr/bin/env python
"""threshold_lower 양수 → 음수 마이그레이션 스크립트

커밋 70049f8 이전에 생성된 알림의 threshold_lower가 양수로 저장되어 있을 수 있음.
변경된 is_threshold_reached 로직은 음수를 기대하므로, 기존 데이터를 변환해야 함.

Usage:
    uv run python scripts/migrate_threshold_lower.py
    uv run python scripts/migrate_threshold_lower.py --dry-run  # 변경 없이 확인만
"""

import sys
from pathlib import Path

project_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(project_root))

from app import create_app, db
from app.config import Config
from app.models import Alert


def migrate(dry_run=False):
    """threshold_lower가 양수인 레코드를 음수로 변환"""
    app = create_app(Config)

    with app.app_context():
        alerts = Alert.query.filter(Alert.threshold_lower > 0).all()

        if not alerts:
            print("변환 대상 없음: 모든 threshold_lower가 이미 음수이거나 NULL입니다.")
            return

        print(f"변환 대상: {len(alerts)}건")
        for alert in alerts:
            old_value = alert.threshold_lower
            new_value = -old_value
            print(
                f"  Alert #{alert.id} ({alert.stock_name}): "
                f"{old_value} → {new_value}"
            )
            if not dry_run:
                alert.threshold_lower = new_value

        if dry_run:
            print("\n[DRY RUN] 실제 변경 없음.")
        else:
            db.session.commit()
            print(f"\n{len(alerts)}건 변환 완료.")


if __name__ == "__main__":
    dry_run = "--dry-run" in sys.argv
    migrate(dry_run=dry_run)
