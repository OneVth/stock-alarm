"use client";

import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SETTINGS_TABS, type SettingsTabId } from "./settings-tabs";
import { ProfileTab } from "./tabs/profile-tab";
import { DataTab } from "./tabs/data-tab";
import { AppInfoTab } from "./tabs/app-info-tab";
import { AccountTab } from "./tabs/account-tab";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** AppSidebar에서 useSession()으로 가져온 사용자 정보 */
  user: {
    email: string;
    nickname: string | null;
    image: string | null;
  };
}

export function SettingsModal({ open, onOpenChange, user }: SettingsModalProps) {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = React.useState<SettingsTabId>("profile");

  // 모달 오픈 시 history entry 추가 → 뒤로가기 버튼으로 모달 닫기
  React.useEffect(() => {
    if (!open) return;

    let closedByPopState = false;
    window.history.pushState({ settingsModalOpen: true }, "");

    const handlePopState = () => {
      closedByPopState = true;
      onOpenChange(false);
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      // X/ESC/backdrop 으로 닫힌 경우 pushState 한 entry 정리
      if (!closedByPopState) {
        window.history.back();
      }
    };
  }, [open, onOpenChange]);

  const tabContent = (
    <>
      {activeTab === "profile"  && <ProfileTab user={user} />}
      {activeTab === "data"     && <DataTab />}
      {activeTab === "app-info" && <AppInfoTab />}
      {activeTab === "account"  && <AccountTab />}
    </>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        {/* 100dvh 풀스크린 — iOS Safari 16+ 지원, 주소창 높이 미포함 */}
        <SheetContent
          side="bottom"
          className="flex flex-col gap-0 p-0"
          style={{ height: "100dvh" }}
        >
          {/* pt: max(기본, 노치/DynamicIsland 높이) */}
          <SheetHeader
            className="shrink-0 border-b px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top,0px))]"
          >
            <SheetTitle>설정</SheetTitle>
          </SheetHeader>

          {/* 상단 가로 탭 네비 */}
          <div className="flex shrink-0 overflow-x-auto border-b">
            {SETTINGS_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                data-active={activeTab === tab.id ? "true" : "false"}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 border-b-2 py-2.5",
                  "whitespace-nowrap text-[14px] font-medium transition-colors duration-150",
                  "data-[active=true]:border-primary data-[active=true]:text-foreground",
                  "data-[active=false]:border-transparent data-[active=false]:text-muted-foreground",
                )}
              >
                <tab.icon className="size-4 shrink-0" />
                {tab.mobileLabel}
              </button>
            ))}
          </div>

          {/* 스크롤 가능한 컨텐츠 — pb: max(기본, 홈 인디케이터 높이) */}
          <div
            className="flex-1 overflow-y-auto px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))]"
          >
            {tabContent}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="overflow-hidden p-0 sm:max-w-3xl"
        showCloseButton={false}
      >
        {/* a11y: 스크린리더용 제목 */}
        <DialogHeader className="sr-only">
          <DialogTitle>설정</DialogTitle>
        </DialogHeader>

        <div className="flex h-[80vh] overflow-hidden">
          {/* 좌측 탭 네비 */}
          <nav className="flex w-48 shrink-0 flex-col gap-1 overflow-y-auto border-r bg-muted/30 p-4">
            <p className="mb-1 px-3 py-2 text-[20px] font-semibold">설정</p>
            {SETTINGS_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                data-active={activeTab === tab.id ? "true" : "false"}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative flex w-full items-center gap-2 rounded-md px-3 py-2",
                  "min-h-11 text-[14px] font-medium transition-colors duration-150",
                  "hover:bg-muted/50",
                  "data-[active=true]:bg-muted data-[active=true]:text-foreground",
                  "data-[active=false]:text-muted-foreground",
                  "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2",
                  "before:h-5 before:w-0.5 before:rounded-r-full",
                  "before:transition-colors before:duration-150",
                  "data-[active=true]:before:bg-primary before:bg-transparent",
                )}
              >
                <tab.icon className="size-4 shrink-0" />
                {tab.label}
              </button>
            ))}
          </nav>

          {/* 우측 컨텐츠 */}
          <div className="flex-1 overflow-y-auto p-6">{tabContent}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
