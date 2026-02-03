"""Flask 앱 팩토리 테스트"""

from app import create_app, db


class TestCreateApp:
    """create_app 함수 테스트"""

    def test_create_app_returns_flask_app(self, app):
        """create_app이 Flask 앱을 반환하는지 확인"""
        from flask import Flask

        assert isinstance(app, Flask)

    def test_app_has_testing_config(self, app):
        """테스트 모드가 활성화되어 있는지 확인"""
        assert app.config["TESTING"] is True

    def test_app_uses_memory_database(self, app):
        """메모리 DB를 사용하는지 확인"""
        assert "memory" in app.config["SQLALCHEMY_DATABASE_URI"]

    def test_blueprints_registered(self, app):
        """Blueprint가 등록되어 있는지 확인"""
        assert "main" in app.blueprints
        assert "settings" in app.blueprints

    def test_database_tables_created(self, app):
        """DB 테이블이 생성되었는지 확인"""
        with app.app_context():
            from sqlalchemy import inspect

            inspector = inspect(db.engine)
            tables = inspector.get_table_names()

            assert "users" in tables
            assert "alerts" in tables
            assert "alert_logs" in tables
