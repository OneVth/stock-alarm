"use client";

import { useState } from "react";
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
  const [activeTab, setActiveTab] = useState<SettingsTabId>("profile");

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
        <SheetContent
          side="bottom"
          className="flex flex-col gap-0 p-0"
          style={{ height: "90vh" }}
        >
          <SheetHeader className="shrink-0 border-b px-4 py-4">
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

          {/* 스크롤 가능한 컨텐츠 */}
          <div className="flex-1 overflow-y-auto p-4">{tabContent}</div>
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
