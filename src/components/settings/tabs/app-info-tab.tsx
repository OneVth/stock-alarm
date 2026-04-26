"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface AppInfoTabProps {
  /** 외부 navigation 시작 직전 호출 — 모달 close + cleanup back() 스킵 지시 */
  onCloseForNavigation: () => void;
}

export function AppInfoTab({ onCloseForNavigation }: AppInfoTabProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-[18px] font-bold">앱 정보</h2>

      <div className="space-y-1">
        {/* 버전 — 정적 정보, hover 효과 없음 */}
        <div className="flex items-center justify-between px-1 py-3">
          <span className="text-[14px] font-medium">버전</span>
          <span className="text-[14px] text-muted-foreground">
            v{process.env.NEXT_PUBLIC_APP_VERSION}
          </span>
        </div>

        {/* 개인정보 처리방침 — 클릭 시 모달 닫고 /privacy 이동 */}
        <Link
          href="/privacy"
          onClick={onCloseForNavigation}
          className="flex items-center justify-between rounded-lg px-1 py-3 transition-colors hover:bg-accent/50"
        >
          <span className="text-[14px] font-medium">개인정보 처리방침</span>
          <ChevronRight className="size-4 text-muted-foreground" />
        </Link>
      </div>
    </div>
  );
}
