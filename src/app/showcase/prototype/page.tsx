"use client";

import { useRef, useState, useCallback } from "react";
import { ComponentSection } from "../_components/component-section";
import { Card, CardContent } from "@/components/ui/card";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { TiptapEditor, TiptapViewer } from "@/components/editor";
import type { JSONContent } from "@tiptap/react";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Bell,
  Plus,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// --- 더미 데이터 ---

interface AlertItem {
  id: string;
  stockName: string;
  stockCode: string;
  currentPrice: number;
  basePrice: number;
  changeRate: number;
  upperThreshold: number;
  lowerThreshold: number;
  active: boolean;
}

const alerts: AlertItem[] = [
  {
    id: "1",
    stockName: "SK하이닉스",
    stockCode: "000660",
    currentPrice: 182000,
    basePrice: 30000,
    changeRate: 506.67,
    upperThreshold: 5,
    lowerThreshold: 3,
    active: true,
  },
  {
    id: "2",
    stockName: "삼성전자",
    stockCode: "005930",
    currentPrice: 71200,
    basePrice: 80250,
    changeRate: -11.25,
    upperThreshold: 10,
    lowerThreshold: 5,
    active: true,
  },
  {
    id: "3",
    stockName: "카카오",
    stockCode: "035720",
    currentPrice: 45000,
    basePrice: 50000,
    changeRate: -10.0,
    upperThreshold: 8,
    lowerThreshold: 4,
    active: false,
  },
  {
    id: "4",
    stockName: "KODEX 2차전지산업Fn",
    stockCode: "305720",
    currentPrice: 6200,
    basePrice: 5900,
    changeRate: 5.08,
    upperThreshold: 7,
    lowerThreshold: 5,
    active: true,
  },
];

// --- 종목 상세 더미 데이터 ---

const dummyAlert = {
  id: "dummy-1",
  stockName: "삼성전자",
  stockCode: "005930",
  basePrice: 70000,
  thresholdUpper: 10,
  thresholdLower: -10,
  status: "active",
  createdAt: "2026-01-15T00:00:00Z",
  memo: {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "반도체 업황 회복 기대. 목표가 85,000원, 손절가 65,000원.",
          },
        ],
      },
    ],
  } as JSONContent,
};

const dummyPrice = {
  price: 75000,
  change: 5000,
  changeRate: 7.14,
};

const dummyAlertLogs = [
  {
    id: "log-1",
    createdAt: "2026-03-13T05:21:00Z",
    basePrice: 70000,
    triggeredPrice: 77000,
    changeRate: 10.0,
    thresholdType: "upper",
    emailSent: true,
  },
  {
    id: "log-2",
    createdAt: "2026-02-28T14:30:00Z",
    basePrice: 70000,
    triggeredPrice: 63000,
    changeRate: -10.0,
    thresholdType: "lower",
    emailSent: true,
  },
  {
    id: "log-3",
    createdAt: "2026-02-15T09:12:00Z",
    basePrice: 70000,
    triggeredPrice: 77500,
    changeRate: 10.71,
    thresholdType: "upper",
    emailSent: false,
  },
  {
    id: "log-4",
    createdAt: "2026-01-30T11:45:00Z",
    basePrice: 70000,
    triggeredPrice: 62500,
    changeRate: -10.71,
    thresholdType: "lower",
    emailSent: true,
  },
  {
    id: "log-5",
    createdAt: "2026-01-20T16:30:00Z",
    basePrice: 70000,
    triggeredPrice: 78000,
    changeRate: 11.43,
    thresholdType: "upper",
    emailSent: true,
  },
  {
    id: "log-6",
    createdAt: "2026-01-10T08:00:00Z",
    basePrice: 70000,
    triggeredPrice: 61000,
    changeRate: -12.86,
    thresholdType: "lower",
    emailSent: true,
  },
  {
    id: "log-7",
    createdAt: "2025-12-20T13:15:00Z",
    basePrice: 70000,
    triggeredPrice: 79000,
    changeRate: 12.86,
    thresholdType: "upper",
    emailSent: true,
  },
];

// --- 헬퍼 함수 ---

const formatPrice = (price: number) => price.toLocaleString("ko-KR") + "원";
const formatChangeRate = (rate: number) =>
  (rate > 0 ? "+" : "") + rate.toFixed(2) + "%";

// --- 종목명 컴포넌트 (truncate 시에만 Tooltip 표시) ---

// TODO(perf): hover 시마다 scrollWidth 체크 - 카드 100개+ 시 최적화 고려
// 옵션: 마운트 시 1회 체크 + 캐싱, 또는 debounce 적용
function StockName({ name }: { name: string }) {
  const textRef = useRef<HTMLParagraphElement>(null);
  const [open, setOpen] = useState(false);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) {
        const el = textRef.current;
        if (el && el.scrollWidth > el.clientWidth) {
          setOpen(true);
        }
      } else {
        setOpen(false);
      }
    },
    [],
  );

  return (
    <TooltipProvider>
      <Tooltip open={open} onOpenChange={handleOpenChange}>
        <TooltipTrigger
          render={
            <p ref={textRef} className="cursor-default truncate font-medium" />
          }
        >
          {name}
        </TooltipTrigger>
        <TooltipContent>
          <p>{name}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// --- 카드 컴포넌트 ---

function AlertCard({ item }: { item: AlertItem }) {
  return (
    <Card className={item.active ? "" : "opacity-60"}>
      <CardContent className="flex items-center justify-between gap-4 p-4">
        {/* 좌측: 그래프 + 종목정보 + 가격정보 */}
        <div className="flex items-center gap-4">
          <div className="h-10 w-20 rounded bg-muted" />
          <div className="w-[120px] shrink-0">
            <StockName name={item.stockName} />
            <p className="text-xs text-muted-foreground">{item.stockCode}</p>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium">{formatPrice(item.currentPrice)}</p>
            <div className="flex items-center gap-1.5 text-xs">
              <span
                className={
                  item.changeRate > 0
                    ? "text-success"
                    : item.changeRate < 0
                      ? "text-destructive"
                      : "text-muted-foreground"
                }
              >
                {formatChangeRate(item.changeRate)}
              </span>
              <span className="text-muted-foreground">
                기준 {formatPrice(item.basePrice)}
              </span>
            </div>
          </div>
        </div>

        {/* 우측: 알림조건 + 액션메뉴 */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-muted-foreground">알림 기준</p>
            <p className="text-sm">
              <span className="font-medium text-success">
                +{item.upperThreshold}%
              </span>
              <span className="text-muted-foreground"> / </span>
              <span className="font-medium text-destructive">
                -{item.lowerThreshold}%
              </span>
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon" className="h-8 w-8" />
              }
            >
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Pencil className="mr-2 h-4 w-4" />
                <span>수정</span>
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>삭제</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}

function AlertCardSkeleton() {
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4 p-4">
        {/* 좌측 */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-20 rounded" />
          <div className="w-[120px] shrink-0 space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-14" />
          </div>
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        {/* 우측 */}
        <div className="flex items-center gap-4">
          <div className="space-y-1.5">
            <Skeleton className="ml-auto h-3 w-12" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </CardContent>
    </Card>
  );
}

function AlertListSkeleton() {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 [&:not(:last-child)]:border-b">
      {/* 좌측: 그래프 + 종목명 + 가격 */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-20 rounded" />
        <div className="w-[120px] shrink-0 space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-14" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      {/* 우측: 알림조건 + 메뉴 */}
      <div className="flex items-center gap-4">
        <div className="space-y-1.5">
          <Skeleton className="ml-auto h-3 w-12" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-8 w-8 rounded" />
      </div>
    </div>
  );
}

// --- 리스트 행 컴포넌트 ---

function AlertListRow({ item }: { item: AlertItem }) {
  return (
    <div
      className={`flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-muted/50 [&:not(:last-child)]:border-b ${item.active ? "" : "opacity-60"}`}
    >
      {/* 좌측: 그래프 + 종목정보 + 가격정보 */}
      <div className="flex items-center gap-4">
        <div className="h-10 w-20 rounded bg-muted" />
        <div className="w-[120px] shrink-0">
          <StockName name={item.stockName} />
          <p className="text-xs text-muted-foreground">{item.stockCode}</p>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium">{formatPrice(item.currentPrice)}</p>
          <div className="flex items-center gap-1.5 text-xs">
            <span
              className={
                item.changeRate > 0
                  ? "text-success"
                  : item.changeRate < 0
                    ? "text-destructive"
                    : "text-muted-foreground"
              }
            >
              {formatChangeRate(item.changeRate)}
            </span>
            <span className="text-muted-foreground">
              기준 {formatPrice(item.basePrice)}
            </span>
          </div>
        </div>
      </div>

      {/* 우측: 알림조건 + 액션메뉴 */}
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-xs text-muted-foreground">알림 기준</p>
          <p className="text-sm">
            <span className="font-medium text-success">
              +{item.upperThreshold}%
            </span>
            <span className="text-muted-foreground"> / </span>
            <span className="font-medium text-destructive">
              -{item.lowerThreshold}%
            </span>
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" className="h-8 w-8" />
            }
          >
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Pencil className="mr-2 h-4 w-4" />
              <span>수정</span>
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              <span>삭제</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// ============================================================
// 종목 상세 페이지 프로토타입 컴포넌트
// ============================================================

// --- 1. DetailHeader ---

function DetailHeader() {
  return (
    <div className="flex items-center gap-3">
      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <div>
        <div className="flex items-center gap-2">
          <p className="text-xl font-bold">{dummyAlert.stockName}</p>
          <Badge
            variant={dummyAlert.status === "active" ? "default" : "secondary"}
            className="cursor-pointer hover:opacity-80"
          >
            {dummyAlert.status === "active" ? "활성" : "비활성"}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{dummyAlert.stockCode}</p>
      </div>
    </div>
  );
}

// --- 2. StockPriceHero ---

function StockPriceHero() {
  const [isEditing, setIsEditing] = useState(false);
  const [basePriceVal, setBasePriceVal] = useState(
    String(dummyAlert.basePrice),
  );
  const [upperVal, setUpperVal] = useState(String(dummyAlert.thresholdUpper));
  const [lowerVal, setLowerVal] = useState(
    String(Math.abs(dummyAlert.thresholdLower)),
  );

  const isPositive = dummyPrice.changeRate > 0;
  const changeSign = isPositive ? "+" : "";

  const upperPrice = Math.round(
    dummyAlert.basePrice * (1 + dummyAlert.thresholdUpper / 100),
  );
  const lowerPrice = Math.round(
    dummyAlert.basePrice * (1 + dummyAlert.thresholdLower / 100),
  );
  const inputCls =
    "w-28 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

  return (
    <div>
      {/* 항상 표시: 현재가 + 변동률 */}
      <p className="text-3xl font-bold">{formatPrice(dummyPrice.price)}</p>
      <p
        className={`mt-1 text-base font-medium ${isPositive ? "text-success" : "text-destructive"}`}
      >
        {changeSign}
        {dummyPrice.changeRate.toFixed(2)}% ({changeSign}
        {formatPrice(dummyPrice.change)})
      </p>

      {isEditing ? (
        /* 편집 모드 */
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-3">
            <label className="w-20 shrink-0 text-sm text-muted-foreground">
              기준가 (원)
            </label>
            <Input
              type="number"
              value={basePriceVal}
              onChange={(e) => setBasePriceVal(e.target.value)}
              className={inputCls}
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="w-20 shrink-0 text-sm text-muted-foreground">
              상승 (%)
            </label>
            <Input
              type="number"
              value={upperVal}
              onChange={(e) => setUpperVal(e.target.value)}
              className={inputCls}
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="w-20 shrink-0 text-sm text-muted-foreground">
              하락 (%)
            </label>
            <Input
              type="number"
              value={lowerVal}
              onChange={(e) => setLowerVal(e.target.value)}
              className={inputCls}
            />
          </div>
          <div className="mt-2 flex justify-end gap-2">
            <Button size="sm" onClick={() => setIsEditing(false)}>
              저장
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(false)}
            >
              취소
            </Button>
          </div>
        </div>
      ) : (
        /* 읽기 모드 */
        <>
          <p className="mt-1 text-sm text-muted-foreground">
            기준 {formatPrice(dummyAlert.basePrice)}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-sm">
              <span className="font-medium text-success">
                상승 +{dummyAlert.thresholdUpper}%
              </span>{" "}
              <span className="text-muted-foreground">
                ({formatPrice(upperPrice)})
              </span>
            </span>
            <span className="text-sm text-muted-foreground">·</span>
            <span className="text-sm">
              <span className="font-medium text-destructive">
                하락 -{Math.abs(dummyAlert.thresholdLower)}%
              </span>{" "}
              <span className="text-muted-foreground">
                ({formatPrice(lowerPrice)})
              </span>
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto h-7 w-7"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function StockPriceHeroSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-9 w-36" />
      <Skeleton className="h-5 w-48" />
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-4 w-64" />
    </div>
  );
}

// --- 3. ChartPlaceholder ---

function ChartPlaceholder() {
  const [period, setPeriod] = useState<"30d" | "90d" | "1y">("30d");
  const [chartType, setChartType] = useState<"line" | "candle">("line");

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-medium">가격 차트</p>
        <div className="flex flex-wrap gap-2">
          {/* 차트 타입 토글 */}
          <div className="flex rounded-md border">
            <Button
              variant={chartType === "line" ? "default" : "ghost"}
              size="sm"
              className="rounded-r-none border-0"
              onClick={() => setChartType("line")}
            >
              라인
            </Button>
            <Button
              variant={chartType === "candle" ? "default" : "ghost"}
              size="sm"
              className="rounded-l-none border-0 border-l"
              onClick={() => setChartType("candle")}
            >
              캔들
            </Button>
          </div>
          {/* 기간 탭 */}
          <div className="flex rounded-md border">
            {(["30d", "90d", "1y"] as const).map((p, i) => (
              <Button
                key={p}
                variant={period === p ? "default" : "ghost"}
                size="sm"
                className={`border-0 ${i === 0 ? "rounded-r-none" : i === 2 ? "rounded-l-none" : "rounded-none border-x"}`}
                onClick={() => setPeriod(p)}
              >
                {p === "30d" ? "30일" : p === "90d" ? "90일" : "1년"}
              </Button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex h-[400px] items-center justify-center rounded-lg border border-dashed">
        <p className="text-sm text-muted-foreground">
          차트 영역 ({chartType === "line" ? "라인" : "캔들"} /{" "}
          {period === "30d" ? "30일" : period === "90d" ? "90일" : "1년"})
        </p>
      </div>
    </div>
  );
}

// --- 5. AlertHistorySection ---

function AlertHistorySection() {
  const [isOpen, setIsOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const displayedLogs = showAll
    ? dummyAlertLogs
    : dummyAlertLogs.slice(0, 5);

  const formatDateTime = (iso: string) => {
    return new Date(iso).toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="border-t pt-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full">
          <div className="flex cursor-pointer items-center justify-between py-1 hover:opacity-70">
            <p className="font-medium">
              알림 이력 ({dummyAlertLogs.length}건)
            </p>
            {isOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-3">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">일시</th>
                    <th className="py-2 pr-4 font-medium">기준가</th>
                    <th className="py-2 pr-4 font-medium">발동가</th>
                    <th className="py-2 pr-4 font-medium">변동률</th>
                    <th className="py-2 pr-4 font-medium">유형</th>
                    <th className="py-2 font-medium">이메일</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedLogs.map((log) => (
                    <tr key={log.id} className="border-b last:border-0">
                      <td className="py-2 pr-4 text-muted-foreground">
                        {formatDateTime(log.createdAt)}
                      </td>
                      <td className="py-2 pr-4">
                        {formatPrice(log.basePrice)}
                      </td>
                      <td className="py-2 pr-4">
                        {formatPrice(log.triggeredPrice)}
                      </td>
                      <td
                        className={`py-2 pr-4 font-medium ${log.changeRate > 0 ? "text-success" : "text-destructive"}`}
                      >
                        {log.changeRate > 0 ? "+" : ""}
                        {log.changeRate.toFixed(2)}%
                      </td>
                      <td className="py-2 pr-4">
                        <Badge
                          variant={
                            log.thresholdType === "upper"
                              ? "default"
                              : "destructive"
                          }
                        >
                          {log.thresholdType === "upper" ? "상승" : "하락"}
                        </Badge>
                      </td>
                      <td className="py-2">
                        <Badge
                          variant={log.emailSent ? "outline" : "secondary"}
                        >
                          {log.emailSent ? "발송" : "미발송"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!showAll && dummyAlertLogs.length > 5 && (
              <div className="mt-3 text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAll(true)}
                >
                  더보기 ({dummyAlertLogs.length - 5}건 더)
                </Button>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

// --- 6. MemoSection ---

function MemoSection({ hasMemo = true }: { hasMemo?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState<JSONContent>(
    dummyAlert.memo,
  );

  return (
    <div className="border-t pt-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full">
          <div className="flex cursor-pointer items-center justify-between py-1 hover:opacity-70">
            <p className="font-medium">메모</p>
            {isOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-3">
            <div className="mb-3 flex items-center justify-between">
              <span />
              {isEditing ? (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => setIsEditing(false)}>
                    저장
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                  >
                    취소
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="mr-1.5 h-3.5 w-3.5" />
                  수정
                </Button>
              )}
            </div>

            {isEditing ? (
              <TiptapEditor
                content={editContent}
                onChange={(c) => setEditContent(c)}
                placeholder="메모를 입력하세요..."
              />
            ) : hasMemo ? (
              <TiptapViewer content={dummyAlert.memo} />
            ) : (
              <p className="text-sm text-muted-foreground">
                메모가 없습니다
              </p>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

// ============================================================
// 설정 페이지 프로토타입 컴포넌트
// ============================================================

const dummyUserNoImage = {
  email: "okayha1726@gmail.com",
  nickname: "OneV",
  image: null as string | null,
};

const dummyUserWithImage = {
  email: "user@gmail.com",
  nickname: "홍길동",
  image: "https://lh3.googleusercontent.com/a/default-user",
};

function SettingsPrototype({
  user,
}: {
  user: { email: string; nickname: string; image: string | null };
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [nicknameVal, setNicknameVal] = useState(user.nickname);

  return (
    <>
      {/* 프로필 영역 */}
      <div className="flex items-start gap-4">
        <Avatar className="h-16 w-16 text-lg shrink-0">
          {user.image ? (
            <AvatarImage src={user.image} alt={user.nickname} />
          ) : (
            <AvatarFallback>{user.nickname.charAt(0)}</AvatarFallback>
          )}
        </Avatar>
        <div className="flex-1 space-y-3">
          <p className="text-sm text-muted-foreground">{user.email}</p>
          {!isEditing ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium shrink-0">닉네임</span>
              <span className="text-sm">{nicknameVal}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                수정
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium shrink-0">닉네임</span>
              <Input
                value={nicknameVal}
                onChange={(e) => setNicknameVal(e.target.value)}
                maxLength={20}
                className="max-w-48"
              />
              <Button size="sm" onClick={() => setIsEditing(false)}>
                저장
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setNicknameVal(user.nickname);
                  setIsEditing(false);
                }}
              >
                취소
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 구분선 + 계정 삭제 */}
      <div className="mt-6 border-t pt-4">
        <div className="flex justify-end">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDialogOpen(true)}
          >
            계정 삭제
          </Button>
        </div>
      </div>

      {/* 삭제 확인 Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>계정 삭제</DialogTitle>
            <DialogDescription>
              정말 삭제하시겠습니까? 모든 알림, 이력, 메모가 영구적으로
              삭제되며 복구할 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={() => setDialogOpen(false)}
            >
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// --- 페이지 ---

export default function PrototypeShowcase() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Prototype</h1>
        <p className="mt-2 text-muted-foreground">
          실제 구현 전 UI 검증을 위한 프로토타입
        </p>
      </div>

      {/* Alert Card */}
      <ComponentSection
        title="Alert Card"
        description="알림 카드 - 상승(초록), 하락(빨강), 비활성 상태"
      >
        <div className="space-y-3">
          {alerts.map((item) => (
            <AlertCard key={item.id} item={item} />
          ))}
        </div>
      </ComponentSection>

      {/* Alert Card - List */}
      <ComponentSection
        title="Alert Card - List"
        description="리스트 행 스타일 - 카드 패딩 없이 border로 구분"
      >
        <Card className="gap-0 py-0">
          {alerts.map((item) => (
            <AlertListRow key={item.id} item={item} />
          ))}
        </Card>
      </ComponentSection>

      {/* Skeleton */}
      <ComponentSection
        title="Alert Card Skeleton"
        description="데이터 로딩 중 스켈레톤 상태"
      >
        <div className="space-y-3">
          <AlertCardSkeleton />
          <AlertCardSkeleton />
        </div>
      </ComponentSection>

      {/* List Skeleton */}
      <ComponentSection
        title="Alert Card - List Skeleton"
        description="Loading state for list style"
      >
        <Card className="gap-0 py-0">
          <AlertListSkeleton />
          <AlertListSkeleton />
        </Card>
      </ComponentSection>

      {/* Empty State */}
      <ComponentSection
        title="Empty State"
        description="등록된 알림이 없는 경우"
      >
        <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
          <div className="rounded-full bg-muted p-4">
            <Bell className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">등록된 알림이 없습니다</p>
            <p className="mt-1 text-sm text-muted-foreground">
              종목을 추가하고 가격 알림을 설정해보세요
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            알림 추가
          </Button>
        </div>
      </ComponentSection>

      {/* ===== 종목 상세 페이지 ===== */}

      <div className="border-t pt-8">
        <h2 className="text-2xl font-bold">종목 상세 페이지</h2>
        <p className="mt-2 text-muted-foreground">
          종목 상세 페이지 컴포넌트 프로토타입
        </p>
      </div>

      {/* 1. DetailHeader */}
      <ComponentSection
        title="DetailHeader"
        description="종목 식별 영역 — 뒤로가기 + 종목명/코드 + 상태 Badge (hover 효과 확인)"
      >
        <DetailHeader />
      </ComponentSection>

      {/* 2. StockPriceHero */}
      <ComponentSection
        title="StockPriceHero"
        description="현재가/변동률 Hero + 도달 정보 + 인라인 편집 — 로드 버전(좌)과 스켈레톤 버전(우)"
      >
        <div className="flex flex-wrap gap-12">
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              로드 상태
            </p>
            <StockPriceHero />
          </div>
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              스켈레톤 상태
            </p>
            <StockPriceHeroSkeleton />
          </div>
        </div>
      </ComponentSection>

      {/* 3. ChartSection */}
      <ComponentSection
        title="ChartSection (Placeholder)"
        description="기간 탭 / 차트 타입 토글 배치 확인 — 실제 차트 대신 placeholder"
      >
        <ChartPlaceholder />
      </ComponentSection>

      {/* 4. AlertHistorySection */}
      <ComponentSection
        title="AlertHistorySection"
        description="기본 접힘 — 클릭 시 펼침, 더보기 버튼으로 나머지 2건 표시"
      >
        <AlertHistorySection />
      </ComponentSection>

      {/* 6. MemoSection (메모 있음) */}
      <ComponentSection
        title="MemoSection (메모 있음)"
        description="기본 접힘 — 펼치면 TiptapViewer, 수정 클릭 시 TiptapEditor"
      >
        <MemoSection hasMemo={true} />
      </ComponentSection>

      {/* 6b. MemoSection (메모 없음) */}
      <ComponentSection
        title="MemoSection (메모 없음)"
        description="메모가 없을 때 placeholder 표시"
      >
        <MemoSection hasMemo={false} />
      </ComponentSection>

      {/* ===== 설정 페이지 ===== */}

      <div className="border-t pt-8">
        <h2 className="text-2xl font-bold">설정 페이지</h2>
        <p className="mt-2 text-muted-foreground">
          프로필 확인/수정 + 계정 삭제 UI 검증
        </p>
      </div>

      {/* 설정 — 이미지 없음 (Fallback) */}
      <ComponentSection
        title="설정 — 이미지 없음 (Fallback)"
        description="Avatar 이니셜 fallback + 닉네임 수정 + 계정 삭제 Dialog"
      >
        <div className="max-w-lg">
          <h1 className="mb-6 text-2xl font-bold">설정</h1>
          <SettingsPrototype user={dummyUserNoImage} />
        </div>
      </ComponentSection>

      {/* 설정 — 이미지 있음 */}
      <ComponentSection
        title="설정 — 이미지 있음"
        description="Google 프로필 이미지 + 닉네임 수정 + 계정 삭제 Dialog"
      >
        <div className="max-w-lg">
          <h1 className="mb-6 text-2xl font-bold">설정</h1>
          <SettingsPrototype user={dummyUserWithImage} />
        </div>
      </ComponentSection>

      {/* 7. 전체 레이아웃 조합 */}
      <ComponentSection
        title="종목 상세 페이지 — 전체 레이아웃"
        description="계층별 정보 배치 검증. Hero(현재가+도달정보) → 차트 → 이력(접힘) → 메모(접힘)"
      >
        <div className="flex flex-col gap-6">
          <DetailHeader />
          <StockPriceHero />
          <ChartPlaceholder />
          <AlertHistorySection />
          <MemoSection hasMemo={true} />
        </div>
      </ComponentSection>
    </div>
  );
}
