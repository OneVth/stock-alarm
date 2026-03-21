"use client";

import { useState } from "react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { AlertFormDialog } from "@/components/dashboard/alert-form-dialog";
import { StockName } from "./stock-name";
import { MiniChart } from "@/components/stock/mini-chart";
import { Skeleton } from "@/components/ui/skeleton";
import type { AlertWithCount } from "@/types/alert";
import {
  MoreHorizontalIcon,
  PencilIcon,
  ToggleLeftIcon,
  ToggleRightIcon,
  Trash2Icon,
} from "lucide-react";

interface AlertListRowProps {
  /** 알림 데이터 */
  alert: AlertWithCount;
  /** 현재가 (없으면 로딩 중 표시) */
  currentPrice?: number;
  /** 미니차트 종가 배열 (없거나 빈 배열이면 placeholder 표시) */
  miniChartData?: number[];
  /** 토글 콜백 */
  onToggle: () => void;
  /** 삭제 콜백 */
  onDelete: () => void;
}

const formatPrice = (price: number) => price.toLocaleString("ko-KR") + "원";

/**
 * 알림 리스트 행 컴포넌트
 *
 * 알림 하나를 리스트 행 스타일로 표시합니다.
 * 행 클릭 시 상세 페이지로 이동하고, 드롭다운으로 수정/토글/삭제를 제공합니다.
 *
 * @param alert - 알림 데이터
 * @param currentPrice - 현재가 (없으면 "--" 표시)
 * @param onToggle - 활성화/비활성화 토글 콜백
 * @param onDelete - 삭제 콜백
 */
export function AlertListRow({
  alert,
  currentPrice,
  miniChartData,
  onToggle,
  onDelete,
}: AlertListRowProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const isActive = alert.status === "active";

  const changeRate =
    currentPrice != null
      ? ((currentPrice - alert.basePrice) / alert.basePrice) * 100
      : null;

  const formatChangeRate = (rate: number) =>
    (rate > 0 ? "+" : "") + rate.toFixed(2) + "%";

  return (
    <>
    <div
      className={`flex items-center justify-between gap-4 px-4 py-3 [&:not(:last-child)]:border-b ${isActive ? "" : "opacity-60"}`}
    >
      {/* 좌측: 그래프 + 종목정보 + 가격정보 */}
      <Link
        href={`/dashboard/${alert.id}`}
        className="flex min-w-0 flex-1 items-center gap-4 transition-colors hover:opacity-80"
      >
        {miniChartData && miniChartData.length > 0 ? (
          <MiniChart data={miniChartData} width={80} height={40} />
        ) : (
          <Skeleton className="h-10 w-20 shrink-0 rounded" />
        )}
        <div className="w-[120px] shrink-0">
          <StockName name={alert.stockName} />
          <p className="text-xs text-muted-foreground">{alert.stockCode}</p>
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-medium">
            {currentPrice != null ? (
              formatPrice(currentPrice)
            ) : (
              <Skeleton className="h-5 w-20" />
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            {changeRate != null ? (
              <span
                className={
                  changeRate > 0
                    ? "text-success"
                    : changeRate < 0
                      ? "text-destructive"
                      : "text-muted-foreground"
                }
              >
                {formatChangeRate(changeRate)}
              </span>
            ) : (
              <Skeleton className="h-4 w-16" />
            )}
            <span className="text-muted-foreground">
              기준 {formatPrice(alert.basePrice)}
            </span>
          </div>
        </div>
      </Link>

      {/* 우측: 알림조건 + 액션메뉴 */}
      <div className="flex shrink-0 items-center gap-4">
        <div className="text-right">
          <p className="text-xs text-muted-foreground">알림 기준</p>
          <p className="text-sm">
            <span className="font-medium text-success">
              {alert.thresholdUpper != null ? `+${alert.thresholdUpper}%` : "--"}
            </span>
            <span className="text-muted-foreground"> / </span>
            <span className="font-medium text-destructive">
              {alert.thresholdLower != null ? `${-Math.abs(alert.thresholdLower)}%` : "--"}
            </span>
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" className="h-8 w-8" />
            }
          >
            <MoreHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">액션</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
              <PencilIcon />
              수정
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onToggle}>
              {isActive ? (
                <>
                  <ToggleLeftIcon />
                  비활성화
                </>
              ) : (
                <>
                  <ToggleRightIcon />
                  활성화
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={onDelete}>
              <Trash2Icon />
              삭제
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
    <AlertFormDialog
      alert={alert}
      open={editDialogOpen}
      onOpenChange={setEditDialogOpen}
    />
    </>
  );
}
