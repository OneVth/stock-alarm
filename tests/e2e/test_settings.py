"""알림 설정 (추가/수정/토글/삭제) E2E 테스트"""

import pytest
from playwright.sync_api import expect


pytestmark = pytest.mark.e2e


def _add_stock(page, base_url, user_uuid, stock_query, stock_name, upper="", lower=""):
    """종목 추가 헬퍼 함수"""
    page.goto(f"{base_url}/settings/{user_uuid}")

    search_input = page.locator("input[placeholder='종목명 또는 코드 검색']")
    search_input.fill(stock_query)

    # 드롭다운 컨테이너 내의 항목만 선택 (테이블 셀과 구분)
    dropdown_item = page.locator(".max-h-60 >> text=" + stock_name).first
    expect(dropdown_item).to_be_visible(timeout=5000)
    dropdown_item.click()

    if upper:
        page.locator("input[name='threshold_upper']").first.fill(upper)
    if lower:
        page.locator("input[name='threshold_lower']").first.fill(lower)

    page.locator("button[type='submit']:has-text('추가')").click()
    page.wait_for_load_state("networkidle")


def _open_action_menu(page, stock_name):
    """작업 메뉴(... 버튼)를 열고 teleported 드롭다운이 나타날 때까지 대기"""
    action_button = page.locator(f"tr:has-text('{stock_name}') button").first
    action_button.click()
    # teleported 드롭다운이 열릴 때까지 잠시 대기
    page.wait_for_timeout(300)


def _click_teleported_button(page, text):
    """teleported 드롭다운 내 버튼을 JS로 클릭 (viewport 밖에 있을 수 있음)"""
    page.evaluate(
        """(text) => {
            const buttons = document.querySelectorAll('button');
            for (const btn of buttons) {
                if (btn.textContent.trim().includes(text)) {
                    btn.click();
                    return;
                }
            }
        }""",
        text,
    )


# ── 설정 페이지 기본 ──────────────────────────────────────────────


def test_settings_page_loads(page, base_url, e2e_user):
    """설정 페이지가 정상 로드되는지 확인"""
    page.goto(f"{base_url}/settings/{e2e_user['uuid']}")

    expect(page).to_have_title("알림 설정 - Stock Alarm")
    expect(page.locator("text=알림 설정")).to_be_visible()
    expect(page.locator(f"text={e2e_user['email']}")).to_be_visible()


def test_invalid_uuid_returns_404(page, base_url):
    """잘못된 UUID로 접근 시 404 반환"""
    response = page.goto(f"{base_url}/settings/invalid-uuid-12345")
    assert response.status == 404


def test_empty_alerts_display(page, base_url, e2e_user):
    """알림이 없는 상태에서 빈 상태 메시지 표시"""
    page.goto(f"{base_url}/settings/{e2e_user['uuid']}")

    empty_message = page.locator("text=등록된 종목이 없습니다")
    expect(empty_message).to_be_visible()


# ── 종목 추가 ─────────────────────────────────────────────────────


def test_add_stock_with_custom_threshold(page, base_url, e2e_user):
    """커스텀 기준으로 종목 추가"""
    _add_stock(
        page, base_url, e2e_user["uuid"],
        stock_query="삼성",
        stock_name="삼성전자",
        upper="15",
        lower="20",
    )

    # 성공 메시지 확인
    success_toast = page.locator("text=삼성전자 (005930) 종목이 추가되었습니다.")
    expect(success_toast).to_be_visible()

    # 테이블에 종목이 표시되는지 확인
    expect(page.locator("td:has-text('삼성전자')")).to_be_visible()

    # 기준값 확인
    expect(page.locator("text=+15.0%")).to_be_visible()
    expect(page.locator("text=-20.0%")).to_be_visible()


def test_add_stock_with_default_threshold(page, base_url, e2e_user):
    """기준값 비워두면 기본값 ±10% 적용"""
    _add_stock(
        page, base_url, e2e_user["uuid"],
        stock_query="SK하이닉스",
        stock_name="SK하이닉스",
    )

    # 성공 메시지 확인
    success_toast = page.locator("text=SK하이닉스 (000660) 종목이 추가되었습니다.")
    expect(success_toast).to_be_visible()

    # 기본값 ±10% 확인
    expect(page.locator("text=+10.0%")).to_be_visible()
    expect(page.locator("text=-10.0%")).to_be_visible()


def test_add_etf_stock(page, base_url, e2e_user):
    """ETF 종목 추가"""
    _add_stock(
        page, base_url, e2e_user["uuid"],
        stock_query="069500",
        stock_name="KODEX 200",
    )

    # 성공 메시지 확인
    success_toast = page.locator("text=KODEX 200 (069500) 종목이 추가되었습니다.")
    expect(success_toast).to_be_visible()

    # 테이블에 종목이 표시되는지 확인
    expect(page.locator("td:has-text('KODEX 200')")).to_be_visible()


def test_add_duplicate_stock_error(page, base_url, e2e_user):
    """이미 등록된 종목 중복 추가 시 에러"""
    # 첫 번째 추가
    _add_stock(
        page, base_url, e2e_user["uuid"],
        stock_query="카카오",
        stock_name="카카오",
    )

    # 같은 종목 다시 추가 시도
    _add_stock(
        page, base_url, e2e_user["uuid"],
        stock_query="카카오",
        stock_name="카카오",
    )

    # 에러 메시지 확인
    error_toast = page.locator("text=이미 등록된 종목입니다.")
    expect(error_toast).to_be_visible()


# ── 알림 수정 (모달) ──────────────────────────────────────────────


def test_edit_alert_threshold(page, base_url, e2e_user):
    """모달을 통한 알림 기준 수정"""
    # 종목 추가
    _add_stock(
        page, base_url, e2e_user["uuid"],
        stock_query="삼성",
        stock_name="삼성전자",
        upper="10",
        lower="10",
    )

    # 작업 메뉴 (... 버튼) 클릭 → 수정 버튼 JS 클릭
    _open_action_menu(page, "삼성전자")
    _click_teleported_button(page, "수정")

    # 모달이 열리는지 확인
    modal_save_button = page.locator(
        "div.fixed >> button:has-text('저장')"
    )
    expect(modal_save_button).to_be_visible()

    # 기준값 수정 (모달 내의 input)
    upper_input = page.locator(
        "form:has(button:has-text('저장')) input[name='threshold_upper']"
    )
    lower_input = page.locator(
        "form:has(button:has-text('저장')) input[name='threshold_lower']"
    )

    upper_input.fill("25")
    lower_input.fill("15")

    # 저장 버튼 클릭
    modal_save_button.click()
    page.wait_for_load_state("networkidle")

    # 수정 성공 메시지 확인
    success_toast = page.locator("text=알림 기준이 수정되었습니다.")
    expect(success_toast).to_be_visible()

    # 수정된 기준값 확인
    expect(page.locator("text=+25.0%")).to_be_visible()
    expect(page.locator("text=-15.0%")).to_be_visible()


# ── 알림 토글 ─────────────────────────────────────────────────────


def test_toggle_alert_status(page, base_url, e2e_user):
    """알림 상태 토글 (활성 → 비활성 → 활성)"""
    # 종목 추가
    _add_stock(
        page, base_url, e2e_user["uuid"],
        stock_query="삼성",
        stock_name="삼성전자",
    )

    # 초기 상태: 활성
    expect(page.locator("text=활성").first).to_be_visible()

    # 작업 메뉴 → 비활성화 (JS 클릭으로 form submit)
    _open_action_menu(page, "삼성전자")
    _click_teleported_button(page, "비활성화")
    page.wait_for_load_state("networkidle")

    # 비활성화 성공 메시지 확인
    success_toast = page.locator("text=비활성화되었습니다.")
    expect(success_toast).to_be_visible()

    # 상태가 비활성으로 변경되었는지 확인
    expect(page.locator("text=비활성").first).to_be_visible()

    # 다시 활성화
    _open_action_menu(page, "삼성전자")
    _click_teleported_button(page, "활성화")
    page.wait_for_load_state("networkidle")

    # 활성화 성공 메시지 확인
    success_toast = page.locator("text=활성화되었습니다.")
    expect(success_toast).to_be_visible()


# ── 알림 삭제 ─────────────────────────────────────────────────────


def test_delete_alert(page, base_url, e2e_user):
    """알림 삭제 (confirm 다이얼로그)"""
    # 종목 추가
    _add_stock(
        page, base_url, e2e_user["uuid"],
        stock_query="삼성",
        stock_name="삼성전자",
    )

    # 종목이 테이블에 있는지 확인
    expect(page.locator("td:has-text('삼성전자')")).to_be_visible()

    # confirm 다이얼로그 자동 수락 설정
    page.on("dialog", lambda dialog: dialog.accept())

    # 작업 메뉴 → 삭제 (JS 클릭)
    _open_action_menu(page, "삼성전자")
    _click_teleported_button(page, "삭제")
    page.wait_for_load_state("networkidle")

    # 삭제 성공 메시지 확인
    success_toast = page.locator("text=종목이 삭제되었습니다.")
    expect(success_toast).to_be_visible()

    # 빈 상태 메시지 표시
    empty_message = page.locator("text=등록된 종목이 없습니다")
    expect(empty_message).to_be_visible()
