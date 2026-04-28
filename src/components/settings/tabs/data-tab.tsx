"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function DataTab() {
  const router = useRouter();
  const [logCount, setLogCount] = React.useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [isResetting, setIsResetting] = React.useState(false);

  React.useEffect(() => {
    fetch("/api/user/alert-logs/count")
      .then((r) => r.json())
      .then((d) => setLogCount(d.count))
      .catch(() => setLogCount(0));
  }, []);

  const isLoading = logCount === null;
  const isEmpty = logCount === 0;

  function handleExport() {
    window.location.href = "/api/user/export/alert-logs";
  }

  async function handleReset() {
    setIsResetting(true);
    try {
      const res = await fetch("/api/user/alert-logs", { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? "오류가 발생했습니다");
        return;
      }
      toast.success("알림 이력이 초기화되었습니다");
      setLogCount(0);
      setConfirmOpen(false);
      router.refresh();
    } finally {
      setIsResetting(false);
    }
  }

  return (
    <>
      <div className="space-y-6">
        <h2 className="text-[18px] font-bold">데이터 & 개인정보</h2>

        <div className="space-y-1">
          <div className="flex items-center justify-between gap-4 px-1 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-medium">알림 이력 CSV 내보내기</p>
              <p className="mt-0.5 text-[12px] text-muted-foreground">
                {isEmpty
                  ? "발송된 알림 이력이 없습니다"
                  : "발송된 알림 이력을 CSV 파일로 다운로드합니다"}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={isLoading || isEmpty}
            >
              다운로드
            </Button>
          </div>

          <div className="flex items-center justify-between gap-4 px-1 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-medium text-destructive">
                알림 이력 초기화
              </p>
              <p className="mt-0.5 text-[12px] text-muted-foreground">
                모든 알림 발송 이력을 영구적으로 삭제합니다. 등록된 알림은 유지됩니다.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-destructive/40 text-destructive hover:bg-destructive/5 hover:text-destructive"
              onClick={() => setConfirmOpen(true)}
              disabled={isLoading || isEmpty}
            >
              초기화
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>알림 이력 초기화</DialogTitle>
            <DialogDescription>
              모든 알림 발송 이력이 영구적으로 삭제됩니다. 등록된 알림은 유지됩니다. 계속하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={isResetting}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleReset}
              disabled={isResetting}
            >
              초기화
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
