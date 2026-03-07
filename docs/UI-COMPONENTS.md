# UI Component Showcase - 컴포넌트 목록

> shadcn/ui 기반, 총 **44개** 컴포넌트 (6개 카테고리)

---

## 1. 레이아웃 & 구조 (6개)

| 컴포넌트 | 설명 | 파일 |
|---|---|---|
| Card | 콘텐츠를 그룹화하는 기본 컨테이너 (Header, Title, Description, Content, Footer) | `ui/card.tsx` |
| Separator | 콘텐츠를 시각적으로 구분하는 구분선 (수평/수직) | `ui/separator.tsx` |
| Aspect Ratio | 콘텐츠의 가로세로 비율 고정 컨테이너 (16:9, 4:3, 1:1) | CSS 기반 (`aspect-video`, `aspect-square`) |
| Scroll Area | 커스텀 스크롤바가 적용된 스크롤 가능 영역 | `ui/scroll-area.tsx` |
| Resizable | 드래그로 크기 조절 가능한 패널 그룹 (수평/수직) | `ui/resizable.tsx` |
| Collapsible | 접었다 펼 수 있는 콘텐츠 영역 | `ui/collapsible.tsx` |

**페이지:** `/layout-components`

---

## 2. 네비게이션 (5개)

| 컴포넌트 | 설명 | 파일 |
|---|---|---|
| Breadcrumb | 현재 페이지 위치를 계층적으로 표시 | `ui/breadcrumb.tsx` |
| Tabs | 탭으로 콘텐츠를 구분하여 표시 | `ui/tabs.tsx` |
| Pagination | 페이지 목록 탐색을 위한 페이지네이션 | `ui/pagination.tsx` |
| Menubar | 데스크톱 앱 스타일의 메뉴 바 (서브메뉴, 체크박스, 라디오 지원) | `ui/menubar.tsx` |
| Command | 키보드 기반의 명령 팔레트 (검색, 그룹, 단축키) | `ui/command.tsx` |

**페이지:** `/navigation`

---

## 3. 데이터 입력 / 폼 (14개)

| 컴포넌트 | 설명 | 파일 |
|---|---|---|
| Button | 다양한 variant(default, secondary, destructive, outline, ghost, link)와 크기(sm, default, lg, icon) | `ui/button.tsx` |
| Input | 텍스트 입력 필드 (email, password, file 등) | `ui/input.tsx` |
| Label | 폼 요소의 라벨 | `ui/label.tsx` |
| Textarea | 여러 줄 텍스트 입력 필드 | `ui/textarea.tsx` |
| Select | 드롭다운 선택 컴포넌트 | `ui/select.tsx` |
| Checkbox | 체크박스 입력 (다중 선택) | `ui/checkbox.tsx` |
| Radio Group | 단일 선택을 위한 라디오 버튼 그룹 | `ui/radio-group.tsx` |
| Switch | On/Off 토글 스위치 | `ui/switch.tsx` |
| Toggle | 토글 버튼 (Bold, Italic, Underline 등) | `ui/toggle.tsx` |
| Toggle Group | 토글 버튼 그룹 (단일/다중 선택) | `ui/toggle-group.tsx` |
| Slider | 범위 값을 선택하는 슬라이더 | `ui/slider.tsx` |
| Calendar | 날짜 선택 캘린더 | `ui/calendar.tsx` |
| Date Picker | 날짜 선택 컴포넌트 (Popover + Calendar 조합) | Popover + Calendar 조합 |
| Input OTP | 일회용 비밀번호(OTP) 입력 (6자리, 그룹 분리) | `ui/input-otp.tsx` |

**페이지:** `/forms`

---

## 4. 데이터 표시 (6개)

| 컴포넌트 | 설명 | 파일 |
|---|---|---|
| Table | 데이터를 테이블 형태로 표시 (Header, Body, Caption) | `ui/table.tsx` |
| Avatar | 사용자 프로필 이미지 또는 폴백 텍스트 표시 | `ui/avatar.tsx` |
| Badge | 상태나 카테고리를 나타내는 라벨 (default, secondary, outline, destructive) | `ui/badge.tsx` |
| Accordion | 접었다 펼 수 있는 콘텐츠 패널 (FAQ 스타일) | `ui/accordion.tsx` |
| Carousel | 좌우로 넘길 수 있는 캐러셀 | `ui/carousel.tsx` |
| Chart | Recharts 기반 데이터 차트 (Bar Chart, Tooltip, Legend) | `ui/chart.tsx` |

**페이지:** `/display`

---

## 5. 피드백 & 상태 (6개)

| 컴포넌트 | 설명 | 파일 |
|---|---|---|
| Alert | 중요한 정보를 알리는 컴포넌트 (default, destructive) | `ui/alert.tsx` |
| Alert Dialog | 중요한 작업 전 확인을 요청하는 모달 | `ui/alert-dialog.tsx` |
| Toast (Sonner) | 일시적인 알림 메시지 (success, error, warning, action) | `ui/sonner.tsx` |
| Progress | 작업 진행 상태를 표시하는 프로그레스 바 | `ui/progress.tsx` |
| Spinner | 로딩 상태를 나타내는 스피너 (Lucide Loader2 + animate-spin) | Lucide 아이콘 기반 |
| Skeleton | 콘텐츠 로딩 중 표시되는 플레이스홀더 | `ui/skeleton.tsx` |

**페이지:** `/feedback`

---

## 6. 오버레이 & 팝업 (7개)

| 컴포넌트 | 설명 | 파일 |
|---|---|---|
| Dialog | 모달 다이얼로그 창 (폼 입력 등) | `ui/dialog.tsx` |
| Sheet | 화면 가장자리에서 슬라이드되는 패널 (top, right, bottom, left) | `ui/sheet.tsx` |
| Popover | 클릭 시 표시되는 팝오버 (폼/설정 등) | `ui/popover.tsx` |
| Tooltip | 호버 시 표시되는 짧은 설명 | `ui/tooltip.tsx` |
| Dropdown Menu | 클릭으로 열리는 드롭다운 메뉴 (그룹, 단축키, 구분선) | `ui/dropdown-menu.tsx` |
| Context Menu | 우클릭으로 열리는 컨텍스트 메뉴 (서브메뉴 지원) | `ui/context-menu.tsx` |
| Hover Card | 호버 시 상세 정보를 보여주는 카드 | `ui/hover-card.tsx` |

**페이지:** `/overlay`

---

## 추가 인프라 컴포넌트

| 컴포넌트 | 설명 | 파일 |
|---|---|---|
| Sidebar | 앱 전체 사이드바 네비게이션 | `ui/sidebar.tsx` |
| Navigation Menu | 네비게이션 메뉴 | `ui/navigation-menu.tsx` |
| Form | React Hook Form 통합 폼 컴포넌트 | `ui/form.tsx` |
| Theme Provider | 다크/라이트 모드 + 컬러 팔레트 관리 | `components/theme-provider.tsx` |
| Theme Switcher | 컬러 팔레트 선택 + 다크/라이트 토글 UI | `components/theme-switcher.tsx` |

---

## 기술 스택

- **컴포넌트 라이브러리:** shadcn/ui (Radix UI 기반)
- **스타일링:** Tailwind CSS v4 (oklch color system)
- **차트:** Recharts
- **폰트:** Pretendard Variable (한글), JetBrains Mono (코드)
- **테마:** 8개 컬러 팔레트 (Zinc, Slate, Rose, Blue, Green, Orange, Violet, Red)
- **다크 모드:** next-themes
