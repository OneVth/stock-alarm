"""설정 라우트 (종목/기준 관리)"""

from flask import Blueprint, render_template, redirect, url_for, flash, abort

from app.models import User

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
    """종목 추가 (Phase 3에서 구현)"""
    # TODO: Phase 3에서 구현
    flash("종목 추가 기능은 아직 구현 중입니다.", "info")
    return redirect(url_for("settings.settings_page", uuid=uuid))


@settings_bp.route("/settings/<uuid>/alerts/<int:alert_id>", methods=["POST"])
def delete_alert(uuid, alert_id):
    """종목 삭제 (Phase 3에서 구현)"""
    # TODO: Phase 3에서 구현
    flash("종목 삭제 기능은 아직 구현 중입니다.", "info")
    return redirect(url_for("settings.settings_page", uuid=uuid))
