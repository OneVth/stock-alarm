"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
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
import { AlertListRow } from "./alert-list-row";
import { AlertEmptyState } from "./alert-empty-state";
import type { AlertWithCount } from "@/types/alert";
import { useStockPrices } from "@/hooks/use-stock-prices";

interface AlertListProps {
  /** 알림 목록 */
  alerts: AlertWithCount[];
}

/**
 * 알림 리스트 컴포넌트
 *
 * 알림 목록을 카드 + 리스트 행 스타일로 표시합니다.
 * 현재가 fetch, 토글/삭제 액션을 처리합니다.
 *
 * @param alerts - 알림 목록
 */
export function AlertList({ alerts }: AlertListProps) {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<AlertWithCount | null>(null);
  const [deleting, setDeleting] = useState(false);

  const stockCodes = useMemo(
    () => [...new Set(alerts.map((a) => a.stockCode))],
    [alerts]
  );
  const { prices } = useStockPrices(stockCodes);

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
    return <AlertEmptyState />;
  }

  return (
    <>
      <Card className="gap-0 py-0">
        {alerts.map((alert) => (
          <AlertListRow
            key={alert.id}
            alert={alert}
            currentPrice={prices[alert.stockCode]?.price}
            onToggle={() => handleToggle(alert)}
            onDelete={() => setDeleteTarget(alert)}
          />
        ))}
      </Card>

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
