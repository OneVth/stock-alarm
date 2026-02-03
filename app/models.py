"""SQLAlchemy 데이터베이스 모델"""

from datetime import datetime

from app import db


class User(db.Model):
    """사용자 모델"""

    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    uuid = db.Column(db.String(36), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # 관계 설정
    alerts = db.relationship(
        "Alert", backref="user", lazy=True, cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<User {self.email}>"


class Alert(db.Model):
    """알림 설정 모델"""

    __tablename__ = "alerts"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    stock_code = db.Column(db.String(20), nullable=False)
    stock_name = db.Column(db.String(100), nullable=False)
    base_price = db.Column(db.Float, nullable=False)
    threshold_upper = db.Column(db.Float, nullable=True)
    threshold_lower = db.Column(db.Float, nullable=True)
    status = db.Column(db.String(20), nullable=False, default="active")
    triggered_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # 관계 설정
    logs = db.relationship(
        "AlertLog", backref="alert", lazy=True, cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Alert {self.stock_name} ({self.stock_code})>"


class AlertLog(db.Model):
    """알림 발송 기록 모델"""

    __tablename__ = "alert_logs"

    id = db.Column(db.Integer, primary_key=True)
    alert_id = db.Column(db.Integer, db.ForeignKey("alerts.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    stock_code = db.Column(db.String(20), nullable=False)
    base_price = db.Column(db.Float, nullable=False)
    current_price = db.Column(db.Float, nullable=False)
    change_rate = db.Column(db.Float, nullable=False)
    threshold_type = db.Column(db.String(10), nullable=False)  # 'upper' or 'lower'
    email_sent = db.Column(db.Boolean, nullable=False, default=False)
    sent_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def __repr__(self):
        return f"<AlertLog {self.stock_code} {self.change_rate:+.2f}%>"
