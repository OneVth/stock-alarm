"""메인 라우트 (홈, 이메일 등록)"""

import re
import uuid

from flask import Blueprint, render_template, request, redirect, url_for, flash, current_app

from app import db
from app.models import User
from app.services.mail import send_welcome_email

main_bp = Blueprint("main", __name__)

EMAIL_REGEX = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"


def is_valid_email(email: str) -> bool:
    """이메일 형식 검증"""
    if not email:
        return False
    return bool(re.match(EMAIL_REGEX, email))


@main_bp.route("/")
def home():
    """홈페이지"""
    return render_template("home.html")


@main_bp.route("/register", methods=["POST"])
def register():
    """이메일 등록 처리"""
    email = request.form.get("email", "").strip()
    current_app.logger.info(f"[등록 요청] 이메일: {email}")

    # 1. 이메일 유효성 검증
    if not email:
        current_app.logger.warning("[등록 실패] 이메일 미입력")
        flash("이메일 주소를 입력해주세요.", "error")
        return redirect(url_for("main.home"))

    if not is_valid_email(email):
        current_app.logger.warning(f"[등록 실패] 이메일 형식 오류: {email}")
        flash("올바른 이메일 주소를 입력해주세요.", "error")
        return redirect(url_for("main.home"))

    # 2. DB에서 이메일로 사용자 조회
    user = User.query.filter_by(email=email).first()

    if not user:
        # 신규 사용자: UUID 생성 및 DB 저장
        user = User(email=email, uuid=str(uuid.uuid4()))
        db.session.add(user)
        db.session.commit()
        current_app.logger.info(f"[신규 사용자] 이메일: {email}, UUID: {user.uuid}")
    else:
        current_app.logger.info(f"[기존 사용자] 이메일: {email}, UUID: {user.uuid}")

    # 3. 설정 URL 생성
    settings_url = f"{request.host_url}settings/{user.uuid}"

    # 4. 환영 이메일 발송
    if send_welcome_email(email, settings_url):
        current_app.logger.info(f"[이메일 발송 성공] 이메일: {email}")
        flash("설정 페이지 URL이 이메일로 발송되었습니다.", "success")
    else:
        current_app.logger.error(f"[이메일 발송 실패] 이메일: {email}")
        flash("이메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요.", "error")

    # 5. 홈페이지로 리다이렉트
    return redirect(url_for("main.home"))
