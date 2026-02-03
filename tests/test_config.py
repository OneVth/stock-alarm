"""설정 모듈 테스트"""

from app.config import Config, BASE_DIR


class TestConfig:
    """Config 클래스 테스트"""

    def test_base_dir_exists(self):
        """BASE_DIR이 올바르게 설정되었는지 확인"""
        assert BASE_DIR.exists()
        assert BASE_DIR.is_dir()

    def test_secret_key_default(self):
        """SECRET_KEY 기본값 확인"""
        # 환경변수가 없을 때 기본값 사용
        assert Config.SECRET_KEY is not None

    def test_database_path_default(self):
        """DATABASE_PATH 기본값 확인"""
        assert Config.DATABASE_PATH == "data/stock_alarm.db"

    def test_sqlalchemy_uri_format(self):
        """SQLALCHEMY_DATABASE_URI 형식 확인"""
        assert Config.SQLALCHEMY_DATABASE_URI.startswith("sqlite:///")

    def test_sqlalchemy_track_modifications_disabled(self):
        """SQLALCHEMY_TRACK_MODIFICATIONS가 비활성화되어 있는지 확인"""
        assert Config.SQLALCHEMY_TRACK_MODIFICATIONS is False
