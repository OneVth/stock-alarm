"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AlertFormDialog } from "./alert-form-dialog";
import { extractMemoPreview } from "@/lib/memo-utils";
import type { AlertWithCount } from "@/types/alert";
import {
  MoreHorizontalIcon,
  PencilIcon,
  ToggleLeftIcon,
  ToggleRightIcon,
  Trash2Icon,
  PlusIcon,
} from "lucide-react";
import { useStockPrices } from "@/hooks/use-stock-prices";

interface AlertTableProps {
  alerts: AlertWithCount[];
}

/**
 * 알림 목록 테이블
 *
 * 종목별 알림 정보를 테이블로 표시하고, 수정/토글/삭제 액션을 제공합니다.
 */
export function AlertTable({ alerts }: AlertTableProps) {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<AlertWithCount | null>(null);
  const [deleting, setDeleting] = useState(false);

  const stockCodes = useMemo(
    () => [...new Set(alerts.map((a) => a.stockCode))],
    [alerts]
  );
  const { prices, isLoading: pricesLoading } = useStockPrices(stockCodes);

  async function handleToggle(alert: AlertWithCount) {
    try {
      const res = await fetch(`/api/alerts/${alert.id}/toggle`, {
        method: "PATCH",
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "상태 변경에 실패했습니다");
        return;
      }
      toast.success(
        alert.status === "active"
          ? "알림이 비활성화되었습니다"
          : "알림이 활성화되었습니다"
      );
      router.refresh();
    } catch {
      toast.error("네트워크 오류가 발생했습니다");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/alerts/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "삭제에 실패했습니다");
        return;
      }
      toast.success("알림이 삭제되었습니다");
      router.refresh();
    } catch {
      toast.error("네트워크 오류가 발생했습니다");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed py-12">
        <p className="text-sm text-muted-foreground">
          등록된 알림이 없습니다
        </p>
        <AlertFormDialog />
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>종목명</TableHead>
            <TableHead className="text-right">기준가</TableHead>
            <TableHead className="text-right">현재가</TableHead>
            <TableHead className="text-right">변동</TableHead>
            <TableHead className="text-right">상승%</TableHead>
            <TableHead className="text-right">하락%</TableHead>
            <TableHead>메모</TableHead>
            <TableHead>상태</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {alerts.map((alert) => {
            const memoPreview = extractMemoPreview(alert.memo);
            return (
              <TableRow key={alert.id}>
                <TableCell className="font-medium">
                  <Link
                    href={`/dashboard/${alert.id}`}
                    className="group block"
                  >
                    <div className="group-hover:underline">
                      {alert.stockName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {alert.stockCode}
                    </div>
                  </Link>
                </TableCell>
                <TableCell className="text-right">
                  {alert.basePrice.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  {pricesLoading ? (
                    <span className="text-muted-foreground">--</span>
                  ) : prices[alert.stockCode] ? (
                    prices[alert.stockCode].price.toLocaleString()
                  ) : (
                    <span className="text-muted-foreground">--</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {(() => {
                    const stockPrice = prices[alert.stockCode];
                    if (pricesLoading || !stockPrice) {
                      return <span className="text-muted-foreground">--</span>;
                    }
                    const rate =
                      ((stockPrice.price - alert.basePrice) / alert.basePrice) * 100;
                    const formatted = `${rate >= 0 ? "+" : ""}${rate.toFixed(2)}%`;
                    if (rate > 0) {
                      return <span className="text-red-500">{formatted}</span>;
                    }
                    if (rate < 0) {
                      return <span className="text-blue-500">{formatted}</span>;
                    }
                    return <span className="text-muted-foreground">{formatted}</span>;
                  })()}
                </TableCell>
                <TableCell className="text-right">
                  {alert.thresholdUpper != null
                    ? `+${alert.thresholdUpper}%`
                    : "--"}
                </TableCell>
                <TableCell className="text-right">
                  {alert.thresholdLower != null
                    ? `${alert.thresholdLower}%`
                    : "--"}
                </TableCell>
                <TableCell>
                  {memoPreview ? (
                    <Tooltip>
                      <TooltipTrigger className="max-w-[120px] truncate text-left text-xs text-muted-foreground">
                        {memoPreview}
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        {memoPreview}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <span className="text-xs text-muted-foreground">--</span>
                  )}
                </TableCell>
                <TableCell>
                  <StatusBadge status={alert.status} />
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button variant="ghost" size="icon-xs" />
                      }
                    >
                      <MoreHorizontalIcon />
                      <span className="sr-only">액션</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <AlertFormDialog
                        alert={alert}
                        trigger={
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <PencilIcon />
                            수정
                          </DropdownMenuItem>
                        }
                      />
                      <DropdownMenuItem onSelect={() => handleToggle(alert)}>
                        {alert.status === "active" ? (
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
                      <DropdownMenuItem
                        variant="destructive"
                        onSelect={() => setDeleteTarget(alert)}
                      >
                        <Trash2Icon />
                        삭제
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>알림 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.stockName} ({deleteTarget?.stockCode}) 알림을
              삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "삭제 중..." : "삭제"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "active":
      return <Badge variant="default">활성</Badge>;
    case "triggered":
      return <Badge variant="destructive">트리거</Badge>;
    case "inactive":
      return <Badge variant="secondary">비활성</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}
