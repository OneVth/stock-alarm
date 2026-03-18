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
import { MoreHorizontal, Pencil, Trash2, Bell, Plus } from "lucide-react";

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

// --- 헬퍼 함수 ---

const formatPrice = (price: number) => price.toLocaleString("ko-KR") + "원";
const formatChangeRate = (rate: number) =>
  (rate > 0 ? "+" : "") + rate.toFixed(2) + "%";

// --- 종목명 컴포넌트 (truncate 시에만 Tooltip 표시) ---

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
    </div>
  );
}
