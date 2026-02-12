"""종목 검색 자동완성 + ETF E2E 테스트"""

import pytest
from playwright.sync_api import expect


pytestmark = pytest.mark.e2e


def test_search_by_name(page, base_url, e2e_user):
    """종목명으로 검색 시 드롭다운이 표시되는지 확인"""
    page.goto(f"{base_url}/settings/{e2e_user['uuid']}")

    search_input = page.locator("input[placeholder='종목명 또는 코드 검색']")
    search_input.fill("삼성")

    # 드롭다운에 삼성전자가 표시되는지 확인
    dropdown_item = page.locator("text=삼성전자")
    expect(dropdown_item).to_be_visible(timeout=5000)


def test_search_by_code(page, base_url, e2e_user):
    """종목코드로 검색 시 드롭다운이 표시되는지 확인"""
    page.goto(f"{base_url}/settings/{e2e_user['uuid']}")

    search_input = page.locator("input[placeholder='종목명 또는 코드 검색']")
    search_input.fill("005930")

    # 드롭다운에 삼성전자가 표시되는지 확인
    dropdown_item = page.locator("text=삼성전자")
    expect(dropdown_item).to_be_visible(timeout=5000)


def test_search_etf(page, base_url, e2e_user):
    """ETF 코드로 검색 시 KODEX 200이 표시되는지 확인"""
    page.goto(f"{base_url}/settings/{e2e_user['uuid']}")

    search_input = page.locator("input[placeholder='종목명 또는 코드 검색']")
    search_input.fill("069500")

    # 드롭다운에 KODEX 200이 표시되는지 확인
    dropdown_item = page.locator("text=KODEX 200")
    expect(dropdown_item).to_be_visible(timeout=5000)


def test_select_from_dropdown(page, base_url, e2e_user):
    """드롭다운 항목 클릭 시 hidden input에 종목코드가 설정되는지 확인"""
    page.goto(f"{base_url}/settings/{e2e_user['uuid']}")

    search_input = page.locator("input[placeholder='종목명 또는 코드 검색']")
    search_input.fill("삼성")

    # 드롭다운 항목 클릭
    dropdown_item = page.locator("text=삼성전자").first
    expect(dropdown_item).to_be_visible(timeout=5000)
    dropdown_item.click()

    # hidden input에 종목코드가 설정되었는지 확인
    hidden_input = page.locator("input[name='stock_code']")
    expect(hidden_input).to_have_value("005930")

    # 검색 입력란에 종목명이 표시되는지 확인
    expect(search_input).to_have_value("삼성전자 (005930)")


def test_keyboard_navigation(page, base_url, e2e_user):
    """키보드 네비게이션 (ArrowDown + Enter)으로 종목 선택"""
    page.goto(f"{base_url}/settings/{e2e_user['uuid']}")

    search_input = page.locator("input[placeholder='종목명 또는 코드 검색']")
    search_input.fill("삼성")

    # 드롭다운이 나타날 때까지 대기
    dropdown_item = page.locator("text=삼성전자")
    expect(dropdown_item).to_be_visible(timeout=5000)

    # ArrowDown으로 첫 번째 항목 선택 후 Enter
    search_input.press("ArrowDown")
    search_input.press("Enter")

    # hidden input에 종목코드가 설정되었는지 확인
    hidden_input = page.locator("input[name='stock_code']")
    expect(hidden_input).to_have_value("005930")
