"use client";

import { useState, type ReactElement } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { GoogleIcon } from "@/components/icons/google";

/**
 * 랜딩 페이지 로그인 Dialog
 *
 * 전달된 `trigger` 요소(Button 등)를 클릭하면 Dialog가 열리고,
 * 내부에서 Google OAuth 서버 액션을 실행합니다.
 * Header "로그인" 버튼, Hero "시작하기" 버튼 등에서 재사용됩니다.
 */
interface LandingLoginDialogProps {
  /** Google signIn 서버 액션 (page.tsx에서 전달) */
  loginAction: () => Promise<void>;
  /**
   * Dialog를 여는 트리거 요소.
   * 단일 React 엘리먼트(예: `<Button>시작하기</Button>`)를 전달하세요.
   */
  trigger: ReactElement;
}

export function LandingLoginDialog({
  loginAction,
  trigger,
}: LandingLoginDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="flex flex-col gap-6 p-8 sm:max-w-md">
        <DialogHeader className="gap-2">
          <DialogTitle className="text-xl">Stock Alarm</DialogTitle>
          <DialogDescription>Google 계정으로 로그인하세요</DialogDescription>
        </DialogHeader>
        <form action={loginAction}>
          <Button type="submit" variant="outline" className="w-full gap-2">
            <GoogleIcon className="h-5 w-5" />
            Google로 로그인
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
