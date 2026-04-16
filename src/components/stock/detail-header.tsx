"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Alert } from "@/generated/prisma/client";

/**
 * 종목 상세 헤더 Props
 */
interface DetailHeaderProps {
  /** 알림 데이터 */
  alert: Alert;
}

/**
 * 상태 Badge variant/텍스트 반환
 */
function getStatusDisplay(status: string): {
  variant: "default" | "secondary" | "destructive" | "outline";
  label: string;
} {
  switch (status) {
    case "active":
      return { variant: "default", label: "활성" };
    case "inactive":
      return { variant: "secondary", label: "비활성" };
    case "triggered":
      return { variant: "destructive", label: "트리거" };
    default:
      return { variant: "outline", label: status };
  }
}

/**
 * 종목 상세 헤더 컴포넌트
 *
 * 뒤로가기, 종목명/코드, 상태 Badge(클릭 시 활성/비활성 토글)를 표시합니다.
 */
export function DetailHeader({ alert }: DetailHeaderProps) {
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState(alert.status);
  const [toggling, setToggling] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { variant, label } = getStatusDisplay(currentStatus);
  const nextLabel = currentStatus === "active" ? "비활성화" : "활성화";

  const handleToggle = async () => {
    setToggling(true);
    try {
      const res = await fetch(`/api/alerts/${alert.id}/toggle`, {
        method: "PATCH",
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "상태 변경에 실패했습니다");
        return;
      }

      const data = await res.json();
      setCurrentStatus(data.status);
      setDialogOpen(false);
      toast.success(`알림이 ${data.status === "active" ? "활성화" : "비활성화"}되었습니다`);
      router.refresh();
    } catch {
      toast.error("네트워크 오류가 발생했습니다");
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="ghost"
        size="icon"
        className="size-11 shrink-0"
        nativeButton={false}
        render={<Link href="/dashboard" />}
      >
        <ArrowLeft className="size-4" />
        <span className="sr-only">뒤로가기</span>
      </Button>
      <div>
        <div className="flex items-center gap-2">
          <p className="text-xl font-bold">{alert.stockName}</p>
          <Badge
            variant={variant}
            className="cursor-pointer hover:opacity-80"
            onClick={() => !toggling && setDialogOpen(true)}
          >
            {label}
          </Badge>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>알림 상태 변경</DialogTitle>
                <DialogDescription>
                  {alert.stockName} 알림을 {nextLabel}하시겠습니까?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  취소
                </Button>
                <Button onClick={handleToggle} disabled={toggling}>
                  {nextLabel}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-sm text-muted-foreground">{alert.stockCode}</p>
      </div>
    </div>
  );
}
