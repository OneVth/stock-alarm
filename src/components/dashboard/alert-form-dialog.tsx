"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertForm } from "./alert-form";
import { PlusIcon } from "lucide-react";
import type { AlertWithCount } from "@/types/alert";

interface AlertFormDialogProps {
  /** 수정할 알림 (없으면 생성 모드) */
  alert?: AlertWithCount;
  /** 커스텀 트리거 (없으면 기본 버튼) */
  trigger?: React.ReactNode;
}

/**
 * 알림 추가/수정 다이얼로그
 *
 * Dialog 래퍼로 AlertForm을 감싸며, 성공 시 자동으로 닫힙니다.
 */
export function AlertFormDialog({ alert, trigger }: AlertFormDialogProps) {
  const [open, setOpen] = useState(false);
  const isEdit = !!alert;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger nativeButton={false} render={trigger as React.ReactElement} />
      ) : (
        <DialogTrigger render={<Button size="sm" />}>
          <PlusIcon />
          새 알림 추가
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "알림 수정" : "새 알림 추가"}</DialogTitle>
        </DialogHeader>
        <AlertForm alert={alert} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
