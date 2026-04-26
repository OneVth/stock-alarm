"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function AccountTab() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    const res = await fetch("/api/user/account", { method: "DELETE" });
    if (res.ok) {
      await signOut({ redirectTo: "/login" });
    } else {
      const data = await res.json();
      toast.error(data.error ?? "오류가 발생했습니다");
      setIsDeleting(false);
      setConfirmOpen(false);
    }
  }

  return (
    <>
      <div className="space-y-6">
        <h2 className="text-[18px] font-bold">계정</h2>

        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-lg px-1 py-2 text-left transition-colors hover:bg-destructive/5"
          onClick={() => setConfirmOpen(true)}
        >
          <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-destructive/10">
            <Trash2 className="size-4 text-destructive" />
          </div>
          <div className="flex-1">
            <p className="text-[14px] font-medium text-destructive">계정 탈퇴</p>
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              모든 데이터가 영구 삭제됩니다
            </p>
          </div>
        </button>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>계정 탈퇴</DialogTitle>
            <DialogDescription>
              정말 탈퇴하시겠습니까? 모든 알림, 이력, 메모가 영구적으로
              삭제되며 복구할 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={isDeleting}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              탈퇴
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
