"""홈페이지 + 이메일 등록 E2E 테스트"""

import pytest
from playwright.sync_api import expect


pytestmark = pytest.mark.e2e


def test_home_page_loads(page, base_url):
    """홈페이지가 정상 로드되고 주요 UI 요소가 표시되는지 확인"""
    page.goto(base_url)

    # 타이틀 확인
    expect(page).to_have_title("Stock Alarm - 주식 알림 서비스")

    # 이메일 입력란과 제출 버튼이 표시되는지 확인
    email_input = page.locator("input[name='email']")
    expect(email_input).to_be_visible()

    submit_button = page.locator("button[type='submit']")
    expect(submit_button).to_be_visible()
    expect(submit_button).to_have_text("시작하기")


def test_register_valid_email(page, base_url):
    """유효한 이메일 등록 시 성공 메시지가 표시되는지 확인"""
    page.goto(base_url)

    page.locator("input[name='email']").fill("valid-e2e@example.com")
    page.locator("button[type='submit']").click()

    # 리다이렉트 후 성공 토스트 확인
    page.wait_for_url(base_url + "/")
    success_toast = page.locator("text=설정 페이지 URL이 이메일로 발송되었습니다.")
    expect(success_toast).to_be_visible()


def test_register_empty_email(page, base_url):
    """빈 이메일 제출 시 브라우저 유효성 검사 또는 에러 메시지 확인"""
    page.goto(base_url)

    # required 속성으로 인해 브라우저가 차단하거나, 서버에서 에러
    email_input = page.locator("input[name='email']")

    # 입력란이 required 속성을 가지고 있는지 확인
    expect(email_input).to_have_attribute("required", "")

    # 빈 상태로 제출 시도 - 브라우저 validation이 막음
    page.locator("button[type='submit']").click()

    # 페이지가 리다이렉트되지 않고 그대로 남아있어야 함
    expect(page).to_have_url(base_url + "/")


def test_register_invalid_email(page, base_url):
    """잘못된 이메일 형식 제출 시 에러 메시지 확인"""
    page.goto(base_url)

    # type="email"이므로 브라우저 validation을 우회하기 위해 JS로 직접 설정
    email_input = page.locator("input[name='email']")
    email_input.evaluate("el => el.type = 'text'")
    email_input.fill("not-an-email")
    page.locator("button[type='submit']").click()

    # 서버에서 에러 메시지 반환
    page.wait_for_url(base_url + "/")
    error_toast = page.locator("text=올바른 이메일 주소를 입력해주세요.")
    expect(error_toast).to_be_visible()
