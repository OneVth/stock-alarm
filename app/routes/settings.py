"""설정 라우트 (종목/기준 관리)"""

import re

from flask import (
    Blueprint,
    render_template,
    redirect,
    url_for,
    flash,
    abort,
    request,
    current_app,
)

from app import db
from app.models import User, Alert, AlertLog
from app.services.stock import (
    is_valid_stock_code_format,
    validate_stock_code,
    get_stock_name,
    get_stock_price,
)

# 알림 기준 기본값
DEFAULT_THRESHOLD_UPPER = 10.0  # +10%
DEFAULT_THRESHOLD_LOWER = -10.0  # -10%

settings_bp = Blueprint("settings", __name__)


@settings_bp.route("/settings/<uuid>")
def settings_page(uuid):
    """사용자 설정 페이지"""
    user = User.query.filter_by(uuid=uuid).first()
    if not user:
        current_app.logger.warning(f"[설정 페이지] 존재하지 않는 UUID: {uuid}")
        abort(404)

    current_app.logger.info(f"[설정 페이지] 접근 성공 - 사용자: {user.email}")

    # 통계 계산
    stats = {
        "total": len(user.alerts),
        "active": len([a for a in user.alerts if a.status == "active"]),
        "triggered": len([a for a in user.alerts if a.status == "triggered"]),
        "inactive": len([a for a in user.alerts if a.status == "inactive"]),
    }

    # 현재가 정보 포함한 알림 목록
    alerts_with_price = []
    for alert in user.alerts:
        try:
            current_price = get_stock_price(alert.stock_code)
            if current_price is not None:
                change_rate = (
                    (current_price - alert.base_price) / alert.base_price
                ) * 100
            else:
                current_price = alert.base_price
                change_rate = 0
        except Exception as e:
            current_app.logger.warning(f"현재가 조회 실패: {alert.stock_code}, {e}")
            current_price = alert.base_price
            change_rate = 0

        alerts_with_price.append(
            {
                "alert": alert,
                "current_price": current_price,
                "change_rate": change_rate,
            }
        )

    return render_template(
        "settings.html",
        user=user,
        stats=stats,
        alerts_with_price=alerts_with_price,
    )


@settings_bp.route("/settings/<uuid>/alerts", methods=["POST"])
def add_alert(uuid):
    """종목 추가"""
    # 1. 사용자 조회
    user = User.query.filter_by(uuid=uuid).first()
    if not user:
        current_app.logger.warning(f"[종목 추가] 존재하지 않는 UUID: {uuid}")
        abort(404)

    # 2. 폼 데이터 추출
    stock_code = request.form.get("stock_code", "").strip()
    threshold_upper = request.form.get("threshold_upper", "").strip()
    threshold_lower = request.form.get("threshold_lower", "").strip()

    current_app.logger.info(
        f"[종목 추가 요청] 사용자: {user.email}, "
        f"종목코드: {stock_code}, 상승: {threshold_upper}%, 하락: {threshold_lower}%"
    )

    # 3. 종목코드 유효성 검증
    if not stock_code:
        current_app.logger.warning(
            f"[종목 추가 실패] 종목코드 미입력 - 사용자: {user.email}"
        )
        flash("종목코드를 입력해주세요.", "error")
        return redirect(url_for("settings.settings_page", uuid=uuid))

    if not is_valid_stock_code_format(stock_code):
        current_app.logger.warning(
            f"[종목 추가 실패] 종목코드 형식 오류: {stock_code} - 사용자: {user.email}"
        )
        flash("종목코드는 6자리 숫자여야 합니다.", "error")
        return redirect(url_for("settings.settings_page", uuid=uuid))

    # 4. 알림 기준 검증 (최소 하나는 필수)
    upper_value = None
    lower_value = None

    if threshold_upper:
        try:
            upper_value = float(threshold_upper)
        except ValueError:
            current_app.logger.warning(
                f"[종목 추가 실패] 상승 기준 형식 오류: {threshold_upper} - 사용자: {user.email}"
            )
            flash("상승 기준은 숫자여야 합니다.", "error")
            return redirect(url_for("settings.settings_page", uuid=uuid))

    if threshold_lower:
        try:
            lower_value = float(threshold_lower)
            # 양수 입력 시 음수로 자동 변환 (예: 10 → -10)
            if lower_value > 0:
                lower_value = -lower_value
        except ValueError:
            current_app.logger.warning(
                f"[종목 추가 실패] 하락 기준 형식 오류: {threshold_lower} - 사용자: {user.email}"
            )
            flash("하락 기준은 숫자여야 합니다.", "error")
            return redirect(url_for("settings.settings_page", uuid=uuid))

    # 둘 다 비어있으면 기본값 적용
    if upper_value is None and lower_value is None:
        upper_value = DEFAULT_THRESHOLD_UPPER
        lower_value = DEFAULT_THRESHOLD_LOWER
        current_app.logger.info(
            f"[종목 추가] 기본값 적용 - 사용자: {user.email}, "
            f"상승: {upper_value}%, 하락: {lower_value}%"
        )

    # 5. 종목코드 실제 존재 여부 검증 (FDR 캐시)
    current_app.logger.debug(f"[종목 검증] FDR 캐시 조회: {stock_code}")
    if not validate_stock_code(stock_code):
        current_app.logger.warning(
            f"[종목 추가 실패] 유효하지 않은 종목코드: {stock_code} - 사용자: {user.email}"
        )
        flash("유효하지 않은 종목코드입니다. 종목코드를 확인해주세요.", "error")
        return redirect(url_for("settings.settings_page", uuid=uuid))

    # 6. 중복 등록 검증
    existing_alert = Alert.query.filter_by(
        user_id=user.id, stock_code=stock_code, status="active"
    ).first()

    if existing_alert:
        current_app.logger.warning(
            f"[종목 추가 실패] 중복 등록: {stock_code} - 사용자: {user.email}"
        )
        flash("이미 등록된 종목입니다.", "error")
        return redirect(url_for("settings.settings_page", uuid=uuid))

    # 7. 종목명 조회 (FDR 캐시)
    current_app.logger.debug(f"[종목명 조회] FDR 캐시: {stock_code}")
    stock_name = get_stock_name(stock_code)
    if not stock_name:
        current_app.logger.error(
            f"[종목 추가 실패] 종목명 조회 실패: {stock_code} - 사용자: {user.email}"
        )
        flash("종목 정보를 조회할 수 없습니다. 잠시 후 다시 시도해주세요.", "error")
        return redirect(url_for("settings.settings_page", uuid=uuid))

    # 8. 현재가 조회 (네이버 API)
    current_app.logger.debug(f"[현재가 조회] 네이버 API: {stock_code}")
    current_price = get_stock_price(stock_code)
    if current_price is None:
        current_app.logger.error(
            f"[종목 추가 실패] 현재가 조회 실패: {stock_code} - 사용자: {user.email}"
        )
        flash("주식 정보를 조회할 수 없습니다. 잠시 후 다시 시도해주세요.", "error")
        return redirect(url_for("settings.settings_page", uuid=uuid))

    # 9. Alert 레코드 생성
    alert = Alert(
        user_id=user.id,
        stock_code=stock_code,
        stock_name=stock_name,
        base_price=current_price,
        threshold_upper=upper_value,
        threshold_lower=lower_value,
        status="active",
    )

    db.session.add(alert)
    db.session.commit()

    current_app.logger.info(
        f"[종목 추가 성공] 사용자: {user.email}, "
        f"종목: {stock_name}({stock_code}), 기준가: {current_price:,.0f}원, "
        f"상승: {upper_value}%, 하락: {lower_value}%"
    )
    flash(f"{stock_name} ({stock_code}) 종목이 추가되었습니다.", "success")
    return redirect(url_for("settings.settings_page", uuid=uuid))


@settings_bp.route("/settings/<uuid>/alerts/<int:alert_id>/update", methods=["POST"])
def update_alert(uuid, alert_id):
    """알림 기준 수정"""
    current_app.logger.info(f"[알림 수정 요청] UUID: {uuid}, Alert ID: {alert_id}")

    # 1. 사용자 조회
    user = User.query.filter_by(uuid=uuid).first()
    if not user:
        current_app.logger.warning(f"[알림 수정 실패] 존재하지 않는 UUID: {uuid}")
        abort(404)

    # 2. Alert 조회
    alert = db.session.get(Alert, alert_id)
    if not alert:
        current_app.logger.warning(
            f"[알림 수정 실패] 존재하지 않는 Alert ID: {alert_id} - 사용자: {user.email}"
        )
        abort(404)

    # 3. 소유권 검증
    if alert.user_id != user.id:
        current_app.logger.warning(
            f"[알림 수정 실패] 권한 없음 - Alert ID: {alert_id}, "
            f"요청자: {user.email}, 소유자 ID: {alert.user_id}"
        )
        abort(403)

    # 4. 폼 데이터 추출
    threshold_upper = request.form.get("threshold_upper", "").strip()
    threshold_lower = request.form.get("threshold_lower", "").strip()

    # 5. 알림 기준 검증
    upper_value = None
    lower_value = None

    if threshold_upper:
        try:
            upper_value = float(threshold_upper)
        except ValueError:
            flash("상승 기준은 숫자여야 합니다.", "error")
            return redirect(url_for("settings.settings_page", uuid=uuid))

    if threshold_lower:
        try:
            lower_value = float(threshold_lower)
            # 양수 입력 시 음수로 자동 변환
            if lower_value > 0:
                lower_value = -lower_value
        except ValueError:
            flash("하락 기준은 숫자여야 합니다.", "error")
            return redirect(url_for("settings.settings_page", uuid=uuid))

    # 둘 다 비어있으면 기본값 적용
    if upper_value is None and lower_value is None:
        upper_value = DEFAULT_THRESHOLD_UPPER
        lower_value = DEFAULT_THRESHOLD_LOWER

    # 6. Alert 업데이트
    alert.threshold_upper = upper_value
    alert.threshold_lower = lower_value
    db.session.commit()

    current_app.logger.info(
        f"[알림 수정 성공] 사용자: {user.email}, "
        f"종목: {alert.stock_name}({alert.stock_code}), "
        f"상승: {upper_value}%, 하락: {lower_value}%"
    )
    flash(f"{alert.stock_name} 알림 기준이 수정되었습니다.", "success")

    # 상세 페이지에서 수정한 경우 상세 페이지로 돌아가기
    if request.form.get("redirect_to") == "stock_detail":
        return redirect(
            url_for("settings.stock_detail", uuid=uuid, alert_id=alert_id)
        )
    return redirect(url_for("settings.settings_page", uuid=uuid))


@settings_bp.route("/settings/<uuid>/alerts/<int:alert_id>/toggle", methods=["POST"])
def toggle_alert_status(uuid, alert_id):
    """알림 상태 토글 (활성/비활성)"""
    current_app.logger.info(f"[상태 변경 요청] UUID: {uuid}, Alert ID: {alert_id}")

    # 1. 사용자 조회
    user = User.query.filter_by(uuid=uuid).first()
    if not user:
        current_app.logger.warning(f"[상태 변경 실패] 존재하지 않는 UUID: {uuid}")
        abort(404)

    # 2. Alert 조회
    alert = db.session.get(Alert, alert_id)
    if not alert:
        current_app.logger.warning(
            f"[상태 변경 실패] 존재하지 않는 Alert ID: {alert_id} - 사용자: {user.email}"
        )
        abort(404)

    # 3. 소유권 검증
    if alert.user_id != user.id:
        current_app.logger.warning(
            f"[상태 변경 실패] 권한 없음 - Alert ID: {alert_id}, "
            f"요청자: {user.email}, 소유자 ID: {alert.user_id}"
        )
        abort(403)

    # 4. 상태 변경
    new_status = request.form.get("status", "active")
    if new_status not in ["active", "inactive"]:
        new_status = "active"

    old_status = alert.status
    alert.status = new_status
    db.session.commit()

    status_label = "활성화" if new_status == "active" else "비활성화"
    current_app.logger.info(
        f"[상태 변경 성공] 사용자: {user.email}, "
        f"종목: {alert.stock_name}({alert.stock_code}), "
        f"{old_status} → {new_status}"
    )
    flash(f"{alert.stock_name} 알림이 {status_label}되었습니다.", "success")
    return redirect(url_for("settings.settings_page", uuid=uuid))


@settings_bp.route("/settings/<uuid>/alerts/<int:alert_id>/delete", methods=["POST"])
def delete_alert(uuid, alert_id):
    """종목 삭제"""
    current_app.logger.info(f"[종목 삭제 요청] UUID: {uuid}, Alert ID: {alert_id}")

    # 1. 사용자 조회
    user = User.query.filter_by(uuid=uuid).first()
    if not user:
        current_app.logger.warning(f"[종목 삭제 실패] 존재하지 않는 UUID: {uuid}")
        abort(404)

    # 2. Alert 조회
    alert = db.session.get(Alert, alert_id)
    if not alert:
        current_app.logger.warning(
            f"[종목 삭제 실패] 존재하지 않는 Alert ID: {alert_id} - 사용자: {user.email}"
        )
        abort(404)

    # 3. 소유권 검증
    if alert.user_id != user.id:
        current_app.logger.warning(
            f"[종목 삭제 실패] 권한 없음 - Alert ID: {alert_id}, "
            f"요청자: {user.email}, 소유자 ID: {alert.user_id}"
        )
        abort(403)

    # 4. 삭제 전 정보 저장 (메시지용)
    stock_name = alert.stock_name
    stock_code = alert.stock_code

    # 5. Alert 삭제 (CASCADE로 AlertLog도 삭제됨)
    db.session.delete(alert)
    db.session.commit()

    current_app.logger.info(
        f"[종목 삭제 성공] 사용자: {user.email}, 종목: {stock_name}({stock_code})"
    )
    flash(f"{stock_name} ({stock_code}) 종목이 삭제되었습니다.", "success")
    return redirect(url_for("settings.settings_page", uuid=uuid))


@settings_bp.route("/settings/<uuid>/stock/<int:alert_id>")
def stock_detail(uuid, alert_id):
    """종목 상세 페이지"""
    user = User.query.filter_by(uuid=uuid).first()
    if not user:
        current_app.logger.warning(f"[종목 상세] 존재하지 않는 UUID: {uuid}")
        abort(404)

    alert = db.session.get(Alert, alert_id)
    if not alert or alert.user_id != user.id:
        current_app.logger.warning(
            f"[종목 상세] 접근 실패 - Alert ID: {alert_id}, UUID: {uuid}"
        )
        abort(404)

    current_app.logger.info(
        f"[종목 상세] 접근 성공 - {alert.stock_name}({alert.stock_code}), "
        f"사용자: {user.email}"
    )

    # 현재가 조회
    try:
        current_price = get_stock_price(alert.stock_code)
        if current_price is not None:
            change_rate = (
                (current_price - alert.base_price) / alert.base_price
            ) * 100
        else:
            current_price = alert.base_price
            change_rate = 0
    except Exception as e:
        current_app.logger.warning(f"현재가 조회 실패: {alert.stock_code}, {e}")
        current_price = alert.base_price
        change_rate = 0

    # 알림 히스토리 (해당 종목만)
    logs = (
        AlertLog.query.filter_by(alert_id=alert.id)
        .order_by(AlertLog.sent_at.desc())
        .all()
    )

    return render_template(
        "stock_detail.html",
        user=user,
        alert=alert,
        current_price=current_price,
        change_rate=change_rate,
        logs=logs,
    )


@settings_bp.route("/settings/<uuid>/history")
def history_page(uuid):
    """알림 히스토리 페이지"""
    user = User.query.filter_by(uuid=uuid).first()
    if not user:
        current_app.logger.warning(f"[히스토리 페이지] 존재하지 않는 UUID: {uuid}")
        abort(404)

    current_app.logger.info(f"[히스토리 페이지] 접근 성공 - 사용자: {user.email}")

    # 페이지네이션
    page = request.args.get("page", 1, type=int)
    per_page = 20

    # AlertLog 조회 (최신순)
    logs_query = AlertLog.query.filter_by(user_id=user.id).order_by(
        AlertLog.sent_at.desc()
    )
    logs_pagination = logs_query.paginate(page=page, per_page=per_page, error_out=False)

    return render_template(
        "history.html",
        user=user,
        logs=logs_pagination.items,
        pagination=logs_pagination,
    )
