"""설정 라우트 (종목/기준 관리)"""

import re

from flask import Blueprint, render_template, redirect, url_for, flash, abort, request

from app import db
from app.models import User, Alert
from app.services.stock import (
    is_valid_stock_code_format,
    validate_stock_code,
    get_stock_name,
    get_stock_price,
)

settings_bp = Blueprint("settings", __name__)


@settings_bp.route("/settings/<uuid>")
def settings_page(uuid):
    """사용자 설정 페이지"""
    user = User.query.filter_by(uuid=uuid).first()
    if not user:
        abort(404)
    return render_template("settings.html", user=user)


@settings_bp.route("/settings/<uuid>/alerts", methods=["POST"])
def add_alert(uuid):
    """종목 추가"""
    # 1. 사용자 조회
    user = User.query.filter_by(uuid=uuid).first()
    if not user:
        abort(404)

    # 2. 폼 데이터 추출
    stock_code = request.form.get("stock_code", "").strip()
    threshold_upper = request.form.get("threshold_upper", "").strip()
    threshold_lower = request.form.get("threshold_lower", "").strip()

    # 3. 종목코드 유효성 검증
    if not stock_code:
        flash("종목코드를 입력해주세요.", "error")
        return redirect(url_for("settings.settings_page", uuid=uuid))

    if not is_valid_stock_code_format(stock_code):
        flash("종목코드는 6자리 숫자여야 합니다.", "error")
        return redirect(url_for("settings.settings_page", uuid=uuid))

    # 4. 알림 기준 검증 (최소 하나는 필수)
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
        except ValueError:
            flash("하락 기준은 숫자여야 합니다.", "error")
            return redirect(url_for("settings.settings_page", uuid=uuid))

    if upper_value is None and lower_value is None:
        flash("상승 또는 하락 기준 중 하나 이상을 입력해주세요.", "error")
        return redirect(url_for("settings.settings_page", uuid=uuid))

    # 5. 종목코드 실제 존재 여부 검증 (FDR 캐시)
    if not validate_stock_code(stock_code):
        flash("유효하지 않은 종목코드입니다. 종목코드를 확인해주세요.", "error")
        return redirect(url_for("settings.settings_page", uuid=uuid))

    # 6. 중복 등록 검증
    existing_alert = Alert.query.filter_by(
        user_id=user.id, stock_code=stock_code, status="active"
    ).first()

    if existing_alert:
        flash("이미 등록된 종목입니다.", "error")
        return redirect(url_for("settings.settings_page", uuid=uuid))

    # 7. 종목명 조회 (FDR 캐시)
    stock_name = get_stock_name(stock_code)
    if not stock_name:
        flash("종목 정보를 조회할 수 없습니다. 잠시 후 다시 시도해주세요.", "error")
        return redirect(url_for("settings.settings_page", uuid=uuid))

    # 8. 현재가 조회 (네이버 API)
    current_price = get_stock_price(stock_code)
    if current_price is None:
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

    flash(f"{stock_name} ({stock_code}) 종목이 추가되었습니다.", "success")
    return redirect(url_for("settings.settings_page", uuid=uuid))


@settings_bp.route("/settings/<uuid>/alerts/<int:alert_id>/delete", methods=["POST"])
def delete_alert(uuid, alert_id):
    """종목 삭제"""
    # 1. 사용자 조회
    user = User.query.filter_by(uuid=uuid).first()
    if not user:
        abort(404)

    # 2. Alert 조회
    alert = db.session.get(Alert, alert_id)
    if not alert:
        abort(404)

    # 3. 소유권 검증
    if alert.user_id != user.id:
        abort(403)

    # 4. 삭제 전 정보 저장 (메시지용)
    stock_name = alert.stock_name
    stock_code = alert.stock_code

    # 5. Alert 삭제 (CASCADE로 AlertLog도 삭제됨)
    db.session.delete(alert)
    db.session.commit()

    flash(f"{stock_name} ({stock_code}) 종목이 삭제되었습니다.", "success")
    return redirect(url_for("settings.settings_page", uuid=uuid))
