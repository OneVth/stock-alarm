"use client";

import { useState, useMemo } from "react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  TrendingUp,
  TrendingDown,
  Home,
  Bell,
  BarChart2,
  Settings,
  ChevronLeft,
  ChevronRight,
  BellRing,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── 더미 데이터 ────────────────────────────────────────────────────────────

interface Stock {
  id: number;
  name: string;
  ticker: string;
  active: boolean;
  currentPrice: number;
  basePrice: number;
  /** 전일 대비 등락률 (%) */
  change: number;
  /** 알림 임계값 (±%) */
  threshold: number;
  /** 최근 7거래일 종가 */
  sparkline: number[];
  /** 오늘 임계값 도달 여부 */
  triggered: boolean;
}

const STOCKS: Stock[] = [
  {
    id: 1,
    name: "삼성전자",
    ticker: "005930",
    active: true,
    currentPrice: 74200,
    basePrice: 72000,
    change: 3.06,
    threshold: 5,
    sparkline: [68000, 69500, 70200, 71000, 72800, 73500, 74200],
    triggered: false,
  },
  {
    id: 2,
    name: "SK하이닉스",
    ticker: "000660",
    active: true,
    currentPrice: 183500,
    basePrice: 175000,
    change: 4.86,
    threshold: 5,
    sparkline: [162000, 168000, 172000, 175000, 179000, 181000, 183500],
    triggered: true,
  },
  {
    id: 3,
    name: "NAVER",
    ticker: "035420",
    active: true,
    currentPrice: 208000,
    basePrice: 215000,
    change: -3.26,
    threshold: 5,
    sparkline: [220000, 218000, 215000, 213000, 210000, 209000, 208000],
    triggered: false,
  },
  {
    id: 4,
    name: "카카오",
    ticker: "035720",
    active: false,
    currentPrice: 43500,
    basePrice: 46000,
    change: -5.43,
    threshold: 5,
    sparkline: [48000, 47500, 46000, 45500, 44000, 43800, 43500],
    triggered: false,
  },
  {
    id: 5,
    name: "LG에너지솔루션",
    ticker: "373220",
    active: true,
    currentPrice: 312000,
    basePrice: 300000,
    change: 4.0,
    threshold: 5,
    sparkline: [285000, 290000, 295000, 300000, 305000, 308000, 312000],
    triggered: false,
  },
  {
    id: 6,
    name: "현대차",
    ticker: "005380",
    active: true,
    currentPrice: 248000,
    basePrice: 245000,
    change: 1.22,
    threshold: 3,
    sparkline: [240000, 242000, 244000, 245000, 246000, 247000, 248000],
    triggered: false,
  },
  {
    id: 7,
    name: "POSCO홀딩스",
    ticker: "005490",
    active: false,
    currentPrice: 338000,
    basePrice: 352000,
    change: -3.98,
    threshold: 5,
    sparkline: [360000, 358000, 355000, 352000, 348000, 342000, 338000],
    triggered: false,
  },
  {
    id: 8,
    name: "LG화학",
    ticker: "051910",
    active: true,
    currentPrice: 285000,
    basePrice: 275000,
    change: 3.64,
    threshold: 5,
    sparkline: [265000, 268000, 271000, 275000, 278000, 282000, 285000],
    triggered: false,
  },
  {
    id: 9,
    name: "셀트리온",
    ticker: "068270",
    active: true,
    currentPrice: 178500,
    basePrice: 168000,
    change: 6.25,
    threshold: 7,
    sparkline: [155000, 160000, 162000, 165000, 170000, 174000, 178500],
    triggered: true,
  },
  {
    id: 10,
    name: "KB금융",
    ticker: "105560",
    active: false,
    currentPrice: 89200,
    basePrice: 91500,
    change: -2.51,
    threshold: 3,
    sparkline: [93000, 92500, 92000, 91500, 91000, 90000, 89200],
    triggered: false,
  },
  {
    id: 11,
    name: "한국전력",
    ticker: "015760",
    active: true,
    currentPrice: 22400,
    basePrice: 21000,
    change: 6.67,
    threshold: 7,
    sparkline: [19500, 20000, 20500, 21000, 21500, 22000, 22400],
    triggered: true,
  },
  {
    id: 12,
    name: "기아",
    ticker: "000270",
    active: false,
    currentPrice: 112000,
    basePrice: 108000,
    change: 3.7,
    threshold: 5,
    sparkline: [102000, 104000, 106000, 108000, 109000, 110000, 112000],
    triggered: false,
  },
];

const ITEMS_PER_PAGE = 4;

// ─── 유틸리티 ────────────────────────────────────────────────────────────────

function formatPrice(price: number): string {
  return price.toLocaleString("ko-KR");
}

// ─── 서브 컴포넌트 ───────────────────────────────────────────────────────────

/** 미니 스파크라인 SVG — stroke는 currentColor로 상위 className에서 제어 */
function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const W = 60;
  const H = 28;

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * W;
      const y = H - ((v - min) / range) * (H - 2) - 1;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      aria-hidden="true"
      className={cn(
        "flex-shrink-0 overflow-visible",
        positive ? "text-green-600" : "text-red-600"
      )}
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** 종목 행 */
function StockRow({ stock }: { stock: Stock }) {
  const positive = stock.change >= 0;
  const sign = positive ? "+" : "";
  const changeFromBase =
    ((stock.currentPrice - stock.basePrice) / stock.basePrice) * 100;
  const thresholdReached = Math.abs(changeFromBase) >= stock.threshold;

  return (
    <div className="flex items-center gap-3 py-3">
      {/* 활성 상태 닷 (44px touch target 충족: 전체 행이 탭 가능) */}
      <div className="flex-shrink-0 self-start mt-1.5">
        <div
          className={cn(
            "size-2 rounded-full",
            stock.active
              ? "bg-[--brand]"
              : "bg-muted-foreground/40"
          )}
          aria-label={stock.active ? "활성" : "비활성"}
        />
      </div>

      {/* 종목 정보 */}
      <div className="flex-1 min-w-0">
        {/* 이름 + 도달 뱃지 */}
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-foreground leading-tight truncate">
            {stock.name}
          </span>
          {stock.triggered && (
            <span className="flex-shrink-0 text-[10px] font-semibold tracking-wide uppercase text-[--brand] bg-[--brand]/10 px-1.5 py-0.5 rounded-full leading-none">
              도달
            </span>
          )}
        </div>

        {/* 종목 코드 + 임계값 */}
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-xs text-muted-foreground">{stock.ticker}</span>
          <span className="text-xs text-muted-foreground/40">·</span>
          <span className="text-xs text-muted-foreground">±{stock.threshold}%</span>
        </div>

        {/* 기준가 + 기준 대비 등락 */}
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-xs text-muted-foreground">
            기준 {formatPrice(stock.basePrice)}
          </span>
          <span
            className={cn(
              "text-xs font-medium",
              thresholdReached
                ? changeFromBase > 0
                  ? "text-green-600"
                  : "text-red-600"
                : "text-muted-foreground"
            )}
          >
            {changeFromBase >= 0 ? "+" : ""}
            {changeFromBase.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* 스파크라인 */}
      <Sparkline data={stock.sparkline} positive={positive} />

      {/* 현재가 + 등락률 */}
      <div className="flex-shrink-0 text-right min-w-[68px]">
        <p className="text-sm font-semibold text-foreground">
          {formatPrice(stock.currentPrice)}
        </p>
        <p
          className={cn(
            "text-xs font-medium mt-0.5",
            positive ? "text-green-600" : "text-red-600"
          )}
        >
          {sign}
          {stock.change.toFixed(2)}%
        </p>
      </div>
    </div>
  );
}

// ─── 메인 페이지 ─────────────────────────────────────────────────────────────

type FilterType = "all" | "active" | "inactive";

export default function StyleseedReferencePage() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeNav, setActiveNav] = useState(1); // 알림 탭 기본

  // 필터링
  const filteredStocks = useMemo(() => {
    return STOCKS.filter((stock) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "active" && stock.active) ||
        (filter === "inactive" && !stock.active);

      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        stock.name.toLowerCase().includes(q) ||
        stock.ticker.includes(q);

      return matchesFilter && matchesSearch;
    });
  }, [filter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredStocks.length / ITEMS_PER_PAGE));
  const pagedStocks = filteredStocks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // 통계
  const activeCount = STOCKS.filter((s) => s.active).length;
  const inactiveCount = STOCKS.filter((s) => !s.active).length;
  const triggeredCount = STOCKS.filter((s) => s.triggered).length;
  const hitRate = Math.round((triggeredCount / activeCount) * 100);

  const handleFilterChange = (value: string) => {
    setFilter(value as FilterType);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const navItems = [
    { icon: Home, label: "홈" },
    { icon: Bell, label: "알림" },
    { icon: BarChart2, label: "시장" },
    { icon: Settings, label: "설정" },
  ] as const;

  return (
    <div className="relative mx-auto max-w-[430px] min-h-screen bg-muted/40">

      {/* ── TopBar ── */}
      <header className="sticky top-0 z-30 bg-muted/40 backdrop-blur-sm pt-[env(safe-area-inset-top)]">
        <div className="flex items-center justify-between px-6 h-14">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.1em] uppercase text-muted-foreground leading-none">
              Stock Alarm
            </p>
            <h1 className="text-lg font-bold tracking-tight text-foreground leading-tight mt-0.5">
              내 알림
            </h1>
          </div>
          <Button
            className="h-11 gap-1.5 rounded-xl px-4 bg-[--brand] text-white hover:bg-[--brand]/90 text-sm font-semibold"
          >
            <Plus className="size-4" />
            알림 추가
          </Button>
        </div>
      </header>

      {/* ── 페이지 콘텐츠 ── */}
      <div className="space-y-6 pt-3 pb-28">

        {/* ── Section D: Hero Card ─ mx-6, p-8 ── */}
        <div className="mx-6">
          <div className="bg-card rounded-2xl p-8 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.1em] uppercase text-muted-foreground mb-3">
                  활성 알림
                </p>
                {/* 숫자 2:1 비율 — 48px 숫자 + 24px 단위 */}
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold tracking-[-0.02em] text-foreground leading-none">
                    {activeCount}
                  </span>
                  <span className="text-2xl font-medium text-muted-foreground leading-none">
                    개
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-3">
                  <TrendingUp className="size-3.5 text-green-600" />
                  <span className="text-sm font-medium text-green-600">
                    +2 since yesterday
                  </span>
                </div>
              </div>
              {/* 아이콘 배지 — brand 10% 불투명도 */}
              <div className="size-12 rounded-xl bg-[--brand]/10 flex items-center justify-center flex-shrink-0">
                <BellRing className="size-5 text-[--brand]" />
              </div>
            </div>

            {/* 하단 3-stat 그리드 */}
            <div className="mt-6 pt-5 border-t border-border/50">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.08em] uppercase text-muted-foreground leading-none">
                    전체 종목
                  </p>
                  <p className="text-base font-bold text-foreground mt-1.5 leading-none">
                    {STOCKS.length}
                    <span className="text-sm font-normal text-muted-foreground ms-0.5">개</span>
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.08em] uppercase text-muted-foreground leading-none">
                    오늘 도달
                  </p>
                  <p className="text-base font-bold text-[--brand] mt-1.5 leading-none">
                    {triggeredCount}
                    <span className="text-sm font-normal text-muted-foreground ms-0.5">건</span>
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.08em] uppercase text-muted-foreground leading-none">
                    적중률
                  </p>
                  <p className="text-base font-bold text-foreground mt-1.5 leading-none">
                    {hitRate}
                    <span className="text-sm font-normal text-muted-foreground ms-0.5">%</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Section B: KPI Grid ─ px-6, grid-cols-2 ── */}
        <div className="px-6">
          <div className="grid grid-cols-2 gap-3">

            {/* KPI 1: 활성 (트렌드 화살표) */}
            <div className="bg-card rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
              <p className="text-[10px] font-semibold tracking-[0.08em] uppercase text-muted-foreground mb-3 leading-none">
                활성
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold tracking-tight text-foreground leading-none">
                  {activeCount}
                </span>
                <span className="text-base font-medium text-muted-foreground leading-none">
                  개
                </span>
              </div>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="size-3 text-green-600" />
                <span className="text-xs font-medium text-green-600">+2 오늘</span>
              </div>
            </div>

            {/* KPI 2: 비활성 (트렌드 화살표) */}
            <div className="bg-card rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
              <p className="text-[10px] font-semibold tracking-[0.08em] uppercase text-muted-foreground mb-3 leading-none">
                비활성
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold tracking-tight text-foreground leading-none">
                  {inactiveCount}
                </span>
                <span className="text-base font-medium text-muted-foreground leading-none">
                  개
                </span>
              </div>
              <div className="flex items-center gap-1 mt-2">
                <TrendingDown className="size-3 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">-1 오늘</span>
              </div>
            </div>

            {/* KPI 3: 오늘 도달 (상태 닷) */}
            <div className="bg-card rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
              <p className="text-[10px] font-semibold tracking-[0.08em] uppercase text-muted-foreground mb-3 leading-none">
                오늘 도달
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold tracking-tight text-[--brand] leading-none">
                  {triggeredCount}
                </span>
                <span className="text-base font-medium text-muted-foreground leading-none">
                  건
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <Activity className="size-3 text-[--brand]" />
                <span className="text-xs font-medium text-[--brand]">알림 발송됨</span>
              </div>
            </div>

            {/* KPI 4: 적중률 (미니 프로그레스 바) */}
            <div className="bg-card rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
              <p className="text-[10px] font-semibold tracking-[0.08em] uppercase text-muted-foreground mb-3 leading-none">
                적중률
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold tracking-tight text-foreground leading-none">
                  {hitRate}
                </span>
                <span className="text-base font-medium text-muted-foreground leading-none">
                  %
                </span>
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-[--brand] transition-all"
                  style={{ width: `${hitRate}%` }}
                />
              </div>
            </div>

          </div>
        </div>

        {/* ── Section A: 종목 목록 카드 ─ mx-6 ── */}
        <div className="mx-6">
          <div className="bg-card rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden">

            {/* 카드 헤더 */}
            <div className="px-6 pt-6 pb-0">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-semibold tracking-[0.08em] uppercase text-muted-foreground">
                  등록 종목
                </p>
                <span className="text-[10px] font-semibold tracking-[0.08em] uppercase text-muted-foreground">
                  {filteredStocks.length}개
                </span>
              </div>

              {/* 필터 탭 */}
              <Tabs value={filter} onValueChange={handleFilterChange}>
                <TabsList className="w-full">
                  <TabsTrigger value="all" className="flex-1 text-xs">
                    전체 ({STOCKS.length})
                  </TabsTrigger>
                  <TabsTrigger value="active" className="flex-1 text-xs">
                    활성 ({activeCount})
                  </TabsTrigger>
                  <TabsTrigger value="inactive" className="flex-1 text-xs">
                    비활성 ({inactiveCount})
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* 검색 */}
              <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="종목명 또는 종목코드"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  aria-label="종목 검색"
                  className="pl-9 h-10 text-sm bg-muted/50 border-0 rounded-xl focus-visible:ring-1 focus-visible:ring-[--brand]/60"
                />
              </div>
            </div>

            {/* 종목 리스트 */}
            <div className="px-6 mt-1">
              {pagedStocks.length > 0 ? (
                <div className="divide-y divide-border/50">
                  {pagedStocks.map((stock) => (
                    <StockRow key={stock.id} stock={stock} />
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Bell className="size-8 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">
                    검색 결과가 없습니다
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    종목명 또는 종목코드를 확인해 주세요
                  </p>
                </div>
              )}
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-border/50">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  aria-label="이전 페이지"
                  className="flex items-center justify-center size-11 rounded-xl bg-muted/60 text-foreground disabled:opacity-30 hover:bg-muted transition-colors"
                >
                  <ChevronLeft className="size-4" />
                </button>

                <div className="flex items-center gap-1.5" role="tablist" aria-label="페이지">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      aria-label={`페이지 ${i + 1}`}
                      aria-current={currentPage === i + 1 ? "page" : undefined}
                      className={cn(
                        "rounded-full transition-all",
                        currentPage === i + 1
                          ? "size-2.5 bg-[--brand]"
                          : "size-2 bg-muted-foreground/25 hover:bg-muted-foreground/50"
                      )}
                    />
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  aria-label="다음 페이지"
                  className="flex items-center justify-center size-11 rounded-xl bg-muted/60 text-foreground disabled:opacity-30 hover:bg-muted transition-colors"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ── Bottom Navigation ── */}
      <nav
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 bg-card/95 backdrop-blur-sm border-t border-border/50 pb-[env(safe-area-inset-bottom)]"
        aria-label="주 메뉴"
      >
        <div className="flex items-center justify-around h-16">
          {navItems.map(({ icon: Icon, label }, idx) => (
            <button
              key={label}
              onClick={() => setActiveNav(idx)}
              aria-label={label}
              aria-current={activeNav === idx ? "page" : undefined}
              className={cn(
                "flex flex-col items-center justify-center gap-1 min-w-[44px] min-h-[44px] px-3 py-2 transition-colors rounded-xl",
                activeNav === idx
                  ? "text-[--brand]"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="size-5" />
              <span className="text-[10px] font-semibold tracking-[0.05em]">
                {label}
              </span>
            </button>
          ))}
        </div>
      </nav>

    </div>
  );
}
