"""Phase 4: LLM 서비스 테스트"""

import pytest
from unittest.mock import patch, MagicMock

from app.services.llm import (
    load_prompt_template,
    get_fallback_comment,
    generate_alert_comment,
    _format_prompt,
    PROMPT_TEMPLATE_PATH,
)


class TestLoadPromptTemplate:
    """프롬프트 템플릿 로드 테스트"""

    def test_load_prompt_template_success(self, app):
        """프롬프트 템플릿 로드 성공"""
        with app.app_context():
            template = load_prompt_template()
            assert template is not None
            assert "종목명" in template
            assert "변동률" in template

    def test_load_prompt_template_file_not_found(self, app):
        """템플릿 파일 없을 때 기본 프롬프트 반환"""
        with app.app_context():
            with patch("app.services.llm.PROMPT_TEMPLATE_PATH", "/nonexistent/path.txt"):
                # 파일이 없어도 기본 프롬프트 반환
                template = load_prompt_template()
                assert template is not None
                assert "주식 시장 분석가" in template


class TestGetFallbackComment:
    """폴백 코멘트 테스트"""

    def test_fallback_comment_upper(self):
        """상승 기준 폴백 코멘트"""
        result = get_fallback_comment("삼성전자", 5.23, "upper")
        assert "삼성전자" in result
        assert "5.23%" in result
        assert "상승" in result

    def test_fallback_comment_lower(self):
        """하락 기준 폴백 코멘트"""
        result = get_fallback_comment("삼성전자", -3.15, "lower")
        assert "삼성전자" in result
        assert "3.15%" in result
        assert "하락" in result

    def test_fallback_comment_negative_rate(self):
        """음수 변동률 절대값 처리"""
        result = get_fallback_comment("삼성전자", -5.0, "lower")
        assert "5.00%" in result
        assert "-5.00%" not in result


class TestFormatPrompt:
    """프롬프트 포맷팅 테스트"""

    def test_format_prompt_upper(self, app):
        """상승 기준 프롬프트 포맷팅"""
        with app.app_context():
            market_summary = {
                "kospi": 2650.42,
                "kosdaq": 845.67,
                "kospi_change": 12.35,
                "kosdaq_change": -3.21,
                "kospi_change_rate": 0.47,
                "kosdaq_change_rate": -0.38,
            }
            result = _format_prompt(
                "삼성전자", "005930", 5.23, "upper", market_summary
            )
            assert "삼성전자" in result
            assert "005930" in result
            assert "+5.23" in result
            assert "상승" in result
            assert "2,650.42" in result

    def test_format_prompt_lower(self, app):
        """하락 기준 프롬프트 포맷팅"""
        with app.app_context():
            market_summary = {
                "kospi": 2650.42,
                "kosdaq": 845.67,
                "kospi_change": -50.0,
                "kosdaq_change": -10.0,
                "kospi_change_rate": -1.5,
                "kosdaq_change_rate": -1.2,
            }
            result = _format_prompt(
                "삼성전자", "005930", -3.15, "lower", market_summary
            )
            assert "하락" in result
            assert "-3.15" in result

    def test_format_prompt_missing_market_data(self, app):
        """시장 데이터 누락 시 기본값 사용"""
        with app.app_context():
            # 빈 market_summary
            result = _format_prompt("삼성전자", "005930", 5.0, "upper", {})
            assert "삼성전자" in result
            # 기본값 0이 사용됨
            assert "0.00" in result


class TestGenerateAlertComment:
    """코멘트 생성 테스트"""

    @pytest.fixture
    def market_summary(self):
        """테스트용 시장 데이터"""
        return {
            "kospi": 2650.42,
            "kosdaq": 845.67,
            "kospi_change": 12.35,
            "kosdaq_change": -3.21,
            "kospi_change_rate": 0.47,
            "kosdaq_change_rate": -0.38,
        }

    def test_generate_comment_no_api_key(self, app, market_summary):
        """API 키 미설정 시 None 반환"""
        with app.app_context():
            app.config["OPENAI_API_KEY"] = None
            result = generate_alert_comment(
                "삼성전자", "005930", 5.23, "upper", market_summary
            )
            assert result is None

    @patch("app.services.llm.OpenAI")
    def test_generate_comment_success(self, mock_openai_class, app, market_summary):
        """정상 코멘트 생성"""
        with app.app_context():
            app.config["OPENAI_API_KEY"] = "test-api-key"

            # Mock 응답 설정
            mock_response = MagicMock()
            mock_response.choices = [MagicMock()]
            mock_response.choices[0].message.content = "삼성전자가 5.23% 상승했습니다."
            mock_response.usage = MagicMock()
            mock_response.usage.total_tokens = 150

            mock_client = MagicMock()
            mock_client.chat.completions.create.return_value = mock_response
            mock_openai_class.return_value = mock_client

            result = generate_alert_comment(
                "삼성전자", "005930", 5.23, "upper", market_summary
            )

            assert result is not None
            assert "삼성전자" in result
            mock_client.chat.completions.create.assert_called_once()

    @patch("app.services.llm.OpenAI")
    def test_generate_comment_auth_error(self, mock_openai_class, app, market_summary):
        """인증 오류 시 None 반환 (재시도 없음)"""
        from openai import AuthenticationError

        with app.app_context():
            app.config["OPENAI_API_KEY"] = "invalid-key"

            mock_client = MagicMock()
            mock_client.chat.completions.create.side_effect = AuthenticationError(
                message="Invalid API key",
                response=MagicMock(status_code=401),
                body=None,
            )
            mock_openai_class.return_value = mock_client

            result = generate_alert_comment(
                "삼성전자", "005930", 5.23, "upper", market_summary
            )

            assert result is None
            # 재시도 없이 1번만 호출
            assert mock_client.chat.completions.create.call_count == 1

    @patch("app.services.llm.OpenAI")
    @patch("app.services.llm.time.sleep")
    def test_generate_comment_retry_then_success(
        self, mock_sleep, mock_openai_class, app, market_summary
    ):
        """재시도 후 성공"""
        from openai import APIConnectionError

        with app.app_context():
            app.config["OPENAI_API_KEY"] = "test-api-key"

            # 첫 번째 호출: 실패, 두 번째 호출: 성공
            mock_response = MagicMock()
            mock_response.choices = [MagicMock()]
            mock_response.choices[0].message.content = "재시도 후 성공 코멘트"
            mock_response.usage = MagicMock()
            mock_response.usage.total_tokens = 100

            mock_client = MagicMock()
            mock_client.chat.completions.create.side_effect = [
                APIConnectionError(message="Connection error", request=MagicMock()),
                mock_response,
            ]
            mock_openai_class.return_value = mock_client

            result = generate_alert_comment(
                "삼성전자", "005930", 5.23, "upper", market_summary
            )

            assert result == "재시도 후 성공 코멘트"
            assert mock_client.chat.completions.create.call_count == 2
            mock_sleep.assert_called_once_with(1)  # BASE_RETRY_DELAY * 2^0

    @patch("app.services.llm.OpenAI")
    @patch("app.services.llm.time.sleep")
    def test_generate_comment_all_retries_fail(
        self, mock_sleep, mock_openai_class, app, market_summary
    ):
        """모든 재시도 실패 시 폴백 코멘트 반환"""
        from openai import APIConnectionError

        with app.app_context():
            app.config["OPENAI_API_KEY"] = "test-api-key"

            mock_client = MagicMock()
            mock_client.chat.completions.create.side_effect = APIConnectionError(
                message="Connection error", request=MagicMock()
            )
            mock_openai_class.return_value = mock_client

            result = generate_alert_comment(
                "삼성전자", "005930", 5.23, "upper", market_summary
            )

            # 폴백 코멘트 반환
            assert result is not None
            assert "삼성전자" in result
            assert "상승" in result
            # 3번 재시도
            assert mock_client.chat.completions.create.call_count == 3
            # 재시도 대기: 1초, 2초
            assert mock_sleep.call_count == 2

    @patch("app.services.llm.OpenAI")
    @patch("app.services.llm.time.sleep")
    def test_generate_comment_rate_limit(
        self, mock_sleep, mock_openai_class, app, market_summary
    ):
        """Rate Limit 오류 시 지수 백오프 재시도"""
        from openai import RateLimitError

        with app.app_context():
            app.config["OPENAI_API_KEY"] = "test-api-key"

            # 2번 실패 후 성공
            mock_response = MagicMock()
            mock_response.choices = [MagicMock()]
            mock_response.choices[0].message.content = "Rate limit 후 성공"
            mock_response.usage = MagicMock()
            mock_response.usage.total_tokens = 100

            mock_client = MagicMock()
            mock_client.chat.completions.create.side_effect = [
                RateLimitError(
                    message="Rate limit exceeded",
                    response=MagicMock(status_code=429),
                    body=None,
                ),
                RateLimitError(
                    message="Rate limit exceeded",
                    response=MagicMock(status_code=429),
                    body=None,
                ),
                mock_response,
            ]
            mock_openai_class.return_value = mock_client

            result = generate_alert_comment(
                "삼성전자", "005930", 5.23, "upper", market_summary
            )

            assert result == "Rate limit 후 성공"
            assert mock_client.chat.completions.create.call_count == 3
            # 지수 백오프: 1초, 2초
            mock_sleep.assert_any_call(1)
            mock_sleep.assert_any_call(2)

    @patch("app.services.llm.OpenAI")
    def test_generate_comment_unexpected_error(
        self, mock_openai_class, app, market_summary
    ):
        """예상치 못한 오류 시 폴백 코멘트 반환"""
        with app.app_context():
            app.config["OPENAI_API_KEY"] = "test-api-key"

            mock_client = MagicMock()
            mock_client.chat.completions.create.side_effect = Exception(
                "Unexpected error"
            )
            mock_openai_class.return_value = mock_client

            result = generate_alert_comment(
                "삼성전자", "005930", -3.15, "lower", market_summary
            )

            # 폴백 코멘트 반환
            assert result is not None
            assert "삼성전자" in result
            assert "하락" in result


class TestIntegration:
    """통합 테스트"""

    def test_full_flow_with_mock(self, app):
        """전체 흐름 Mock 테스트"""
        with app.app_context():
            app.config["OPENAI_API_KEY"] = "test-key"

            market_summary = {
                "kospi": 2650.42,
                "kosdaq": 845.67,
                "kospi_change": 12.35,
                "kosdaq_change": -3.21,
                "kospi_change_rate": 0.47,
                "kosdaq_change_rate": -0.38,
            }

            with patch("app.services.llm.OpenAI") as mock_openai_class:
                mock_response = MagicMock()
                mock_response.choices = [MagicMock()]
                mock_response.choices[0].message.content = (
                    "삼성전자가 등록가 대비 5.23% 상승하여 설정하신 기준에 도달했습니다. "
                    "오늘 코스피 지수는 2,650.42로 전일 대비 0.47% 상승하며 "
                    "전반적으로 상승세를 보이고 있습니다."
                )
                mock_response.usage = MagicMock()
                mock_response.usage.total_tokens = 200

                mock_client = MagicMock()
                mock_client.chat.completions.create.return_value = mock_response
                mock_openai_class.return_value = mock_client

                result = generate_alert_comment(
                    stock_name="삼성전자",
                    stock_code="005930",
                    change_rate=5.23,
                    threshold_type="upper",
                    market_summary=market_summary,
                )

                assert result is not None
                assert len(result) > 50  # 충분한 길이
                assert "삼성전자" in result
                assert "5.23%" in result

                # API 호출 검증
                call_args = mock_client.chat.completions.create.call_args
                assert call_args.kwargs["model"] == "gpt-5-nano"
                assert call_args.kwargs["max_completion_tokens"] == 2000
