"""메인 라우트 (홈, 이메일 등록)"""

from flask import Blueprint, render_template

main_bp = Blueprint("main", __name__)


@main_bp.route("/")
def home():
    """홈페이지"""
    return render_template("home.html")
