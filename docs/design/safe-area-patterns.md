# Safe Area 패턴 가이드

> 작성일: 2026-04-26  
> 컨텍스트: `feat/settings-modal-shell` 브랜치 작업 중 발견된 이슈 정리  
> 관련 보고서: `docs/report/feat-settings-modal-shell-2026-04-26.md` §8

---

## 배경

iOS 노치 / Dynamic Island, Android 디스플레이 컷아웃 영역에 컨텐츠가 가리지 않도록 safe area inset 값을 패딩으로 반영하는 패턴이 필요하다. 이 프로젝트는 풀스크린 Sheet, 모달 등 safe area 처리 지점이 여러 곳 있어 일관된 패턴을 정의한다.

---

## 프로젝트 내 정의된 클래스

`src/styles/base.css`에 **unlayered CSS**로 정의됨:

```css
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

.pt-safe {
  padding-top: env(safe-area-inset-top, 0px);
}

.px-safe {
  padding-left: env(safe-area-inset-left, 0px);
  padding-right: env(safe-area-inset-right, 0px);
}
```

**중요**: `@layer` 바깥에 정의되어 있어 CSS Cascade Layer 명세상 `@layer utilities`의 모든 클래스(`py-4`, `pt-4` 등)보다 **항상 우선**한다. 소스 순서나 클래스 순서에 무관하게 확정적으로 이긴다.

빌드 결과(`src_styles_index_css_*.single.css`) 기준 레이어 순서:
```
@layer properties   ← 최저 우선순위
@layer theme
@layer base
@layer components
@layer utilities    ← py-4, pt-4, pt-[max(...)] 등 Tailwind 유틸리티
(unlayered)         ← pt-safe, pb-safe, sr-only 등 base.css 하단 ← 최고 우선순위
```

---

## 함정 — 단독 사용의 위험

### 비노치 기기에서 패딩 소실

`env(safe-area-inset-top, 0px)`는 비노치 기기에서 `0px`로 평가된다 (Android 대부분, iPhone SE 등).

```html
<!-- ❌ 비노치 기기에서 padding-top: 0px (베이스 패딩 소실) -->
<div class="py-4 pt-safe">
<div class="pt-safe py-4">  <!-- 순서를 바꿔도 동일 결과 -->
```

`pt-safe`가 unlayered로 항상 이기므로 `py-4`의 `1rem`이 무력화되고, 비노치 기기에선 결국 `0px`이 되어 베이스 패딩이 사라진다.

| 기기 | `pt-safe` 결과 | `py-4 + pt-safe` 결과 |
|---|---|---|
| 비노치 (Android, iPhone SE) | 0px | 0px ❌ |
| 소형 노치 (~20px) | 20px | 20px |
| Dynamic Island (~59px) | 59px | 59px |

---

## 권장 패턴 — 케이스별 분기

| 상황 | 권장 패턴 | 사유 |
|---|---|---|
| **풀스크린 컨테이너 상단** (헤더, SheetHeader) — 베이스 패딩 + safe area 둘 다 필요 | `pt-[max(Npx,env(safe-area-inset-top,0px))]` | 비노치 N px 보장 + 노치 inset 반영 동시 커버 |
| **스크롤 영역 하단** (home indicator 위) — 베이스 패딩 + safe area 둘 다 필요 | `pb-[max(Npx,env(safe-area-inset-bottom,0px))]` | 동일 사유 |
| **Fixed 포지션 wrapper — safe area 추가분만 필요** (내부 패딩은 자식에서 관리) | `pt-safe` / `pb-safe` 사용 가능 | 베이스 패딩이 없는 wrapper 역할, 0px baseline 허용 |
| **`pt-safe` + `py-N` / `pt-N` 조합** | ❌ **사용 금지** | unlayered가 항상 이겨 베이스 패딩 무력화 |

---

## 실무 적용 예시

### 풀스크린 Sheet (현재 SettingsModal 적용 패턴)

```tsx
<SheetContent
  side="bottom"
  className="flex flex-col gap-0 p-0"
  style={{ height: "100dvh" }}
>
  <SheetHeader
    className="shrink-0 border-b px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top,0px))]"
  >
    <SheetTitle>설정</SheetTitle>
  </SheetHeader>
  <div className="flex-1 overflow-y-auto px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))]">
    {/* 컨텐츠 */}
  </div>
</SheetContent>
```

### Fixed Bottom Bar (베이스 패딩을 자식이 관리)

```tsx
{/* pb-safe: wrapper에서 safe area만 처리, 베이스 패딩은 자식 div에서 */}
<div className="fixed bottom-0 left-0 right-0 pb-safe">
  <div className="py-4 px-6 bg-card">
    {/* 컨텐츠 */}
  </div>
</div>
```

---

## 사용하지 않는 케이스

- 데스크톱 전용 컴포넌트 (모바일 노치 영향 없음)
- 모달이지만 풀스크린이 아닌 케이스 (`max-w-3xl max-h-[80vh]` 등 — backdrop이 외곽 보호)
- 페이지 본문 스크롤 영역 (Next.js 기본 viewport 처리에 의존)

---

## 참고

- **CSS Cascade Layers 명세**: 비계층(unlayered) CSS는 모든 `@layer` 선언보다 우선. 소스 순서나 HTML 클래스 순서와 무관.
- **`100dvh`** (dynamic viewport height): iOS Safari 16+ 지원, 주소창 높이 미포함. 풀스크린 Sheet에서 `100vh` 대신 권장.
- 후속 브랜치(`feat/settings-data-section`, `feat/settings-app-info`)에서 모바일 영향을 받는 신규 컴포넌트 추가 시 이 가이드를 따를 것.
