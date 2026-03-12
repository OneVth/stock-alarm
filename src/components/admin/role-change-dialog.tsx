"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

import type { AdminUser } from "@/types/admin";

interface RoleChangeDialogProps {
  /** 대상 사용자 (null이면 닫힘) */
  user: AdminUser | null;
  /** 역할 변경 액션 */
  action: "grant" | "revoke";
  /** 다이얼로그 닫기 콜백 */
  onClose: () => void;
}

/**
 * 역할 변경 확인 다이얼로그
 *
 * admin 역할 부여/해제 전 확인을 요청합니다.
 */
export function RoleChangeDialog({
  user,
  action,
  onClose,
}: RoleChangeDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "오류가 발생했습니다");
        return;
      }

      router.refresh();
    } finally {
      setLoading(false);
      onClose();
    }
  };

  const isGrant = action === "grant";

  return (
    <AlertDialog open={!!user} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isGrant ? "관리자 권한 부여" : "관리자 권한 해제"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {user?.nickname} ({user?.email})에게{" "}
            {isGrant
              ? "관리자 권한을 부여하시겠습니까?"
              : "관리자 권한을 해제하시겠습니까?"}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>취소</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            variant={isGrant ? "default" : "destructive"}
          >
            {loading ? "처리 중..." : isGrant ? "부여" : "해제"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
