"use client";

import { useState } from "react";
import {
  Download,
  ExternalLink,
  LogOut,
  PencilIcon,
  Trash2,
  X,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

// --- 더미 데이터 ---
const DUMMY_VERSION = "v0.2.1";

type DummyUser = {
  email: string;
  nickname: string;
  image: string | null;
};

const INITIAL_USER: DummyUser = {
  email: "user@example.com",
  nickname: "테스트유저",
  image: null,
};

// --- 탭 정의 ---
type TabId = "profile" | "data" | "app-info" | "account";

const TABS: { id: TabId; label: string; mobileLabel: string }[] = [
  { id: "profile",  label: "프로필",           mobileLabel: "프로필" },
  { id: "data",     label: "데이터 & 개인정보",  mobileLabel: "데이터" },
  { id: "app-info", label: "앱 정보",           mobileLabel: "앱 정보" },
  { id: "account",  label: "계정",              mobileLabel: "계정" },
];

// --- 프로필 탭 ---
interface ProfileTabProps {
  user: DummyUser;
  onNicknameChange: (nickname: string) => void;
}

function ProfileTab({ user, onNicknameChange }: ProfileTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [nicknameVal, setNicknameVal] = useState(user.nickname);
  const [isSaving, setIsSaving] = useState(false);

  function handleSave() {
    setIsSaving(true);
    console.log("PATCH /api/user/profile", { nickname: nicknameVal });
    setTimeout(() => {
      onNicknameChange(nicknameVal);
      setIsEditing(false);
      setIsSaving(false);
    }, 300);
  }

  function handleCancel() {
    setNicknameVal(user.nickname);
    setIsEditing(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">이미지</p>
        <Avatar className="size-16">
          {user.image ? (
            <AvatarImage src={user.image} alt={user.nickname} />
          ) : (
            <AvatarFallback className="text-lg">
              {user.nickname.charAt(0)}
            </AvatarFallback>
          )}
        </Avatar>
      </div>

      <div>
        <p className="mb-1 text-xs font-medium text-muted-foreground">이메일</p>
        <p className="text-sm">{user.email}</p>
      </div>

      <div>
        <label
          htmlFor="nickname-input"
          className="mb-1 block text-xs font-medium text-muted-foreground"
        >
          닉네임
        </label>
        <div className="flex flex-wrap items-center justify-between gap-2">
          {!isEditing ? (
            <p className="text-sm">{user.nickname}</p>
          ) : (
            <Input
              id="nickname-input"
              value={nicknameVal}
              onChange={(e) => setNicknameVal(e.target.value)}
              maxLength={20}
              className="w-full max-w-xs"
            />
          )}
          {!isEditing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <PencilIcon className="size-3.5" />
              수정
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSave}
                disabled={
                  isSaving ||
                  !nicknameVal.trim() ||
                  nicknameVal === user.nickname
                }
              >
                저장
              </Button>
              <Button variant="outline" size="sm" onClick={handleCancel}>
                취소
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- 데이터 & 개인정보 탭 ---
function DataTab() {
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  return (
    <>
      <div>
        {/* CSV 내보내기 */}
        <div className="flex items-center justify-between border-b py-3">
          <div className="mr-4">
            <p className="text-sm font-medium">알림 이력 CSV 내보내기</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              발송된 알림 이력을 CSV 파일로 다운로드합니다
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() => console.log("GET /api/user/export/alert-logs")}
          >
            <Download className="size-3.5" />
            다운로드
          </Button>
        </div>

        {/* 알림 이력 초기화 */}
        <div className="flex items-center justify-between py-3">
          <div className="mr-4">
            <p className="text-sm font-medium text-destructive">
              알림 이력 초기화
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              모든 알림 발송 이력을 영구적으로 삭제합니다. 등록된 알림은 유지됩니다.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 border-destructive/50 text-destructive hover:bg-destructive/5 hover:text-destructive"
            onClick={() => setConfirmClearOpen(true)}
          >
            초기화
          </Button>
        </div>
      </div>

      {/* 알림 이력 초기화 확인 Dialog — 설정 모달 위에 중첩 */}
      <Dialog open={confirmClearOpen} onOpenChange={setConfirmClearOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>알림 이력 초기화</DialogTitle>
            <DialogDescription>
              모든 알림 발송 이력이 영구적으로 삭제됩니다. 등록된 알림은
              유지됩니다. 계속하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmClearOpen(false)}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                console.log("DELETE /api/user/alert-logs");
                setConfirmClearOpen(false);
              }}
            >
              초기화
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// --- 앱 정보 탭 ---
function AppInfoTab() {
  return (
    <div>
      {/* 버전 */}
      <div className="flex items-center justify-between border-b py-3">
        <p className="text-sm font-medium">버전</p>
        <span className="text-sm text-muted-foreground">{DUMMY_VERSION}</span>
      </div>

      {/* 개인정보 처리방침 — 새 탭으로 열기 */}
      <div className="flex items-center justify-between py-3">
        <p className="text-sm font-medium">개인정보 처리방침</p>
        <a
          href="/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ExternalLink className="size-3.5" />
          열기
        </a>
      </div>
    </div>
  );
}

// --- 계정 탭 ---
interface AccountTabProps {
  user: DummyUser;
}

function AccountTab({ user }: AccountTabProps) {
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  function handleDelete() {
    setIsDeleting(true);
    console.log("DELETE /api/user/account");
    setTimeout(() => {
      setIsDeleting(false);
      setConfirmDeleteOpen(false);
    }, 300);
  }

  return (
    <>
      <div className="space-y-4">
        {/* 연결된 계정 + 로그아웃 */}
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
              {/* Google 로고 */}
              <svg
                className="size-4"
                viewBox="0 0 24 24"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium">Google 계정</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => console.log("signOut({ redirectTo: '/login' })")}
          >
            <LogOut className="size-3.5" />
            로그아웃
          </Button>
        </div>

        <Separator />

        {/* 계정 탈퇴 */}
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-lg px-1 py-2 text-left transition-colors hover:bg-destructive/5"
          onClick={() => setConfirmDeleteOpen(true)}
        >
          <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-destructive/10">
            <Trash2 className="size-4 text-destructive" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-destructive">계정 탈퇴</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              계정과 데이터가 전부 삭제됩니다.
            </p>
          </div>
        </button>
      </div>

      {/* 계정 탈퇴 확인 Dialog */}
      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
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
              onClick={() => setConfirmDeleteOpen(false)}
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

// --- 탭 컨텐츠 스위처 ---
interface TabContentProps {
  activeTab: TabId;
  user: DummyUser;
  onNicknameChange: (nickname: string) => void;
}

function TabContent({ activeTab, user, onNicknameChange }: TabContentProps) {
  switch (activeTab) {
    case "profile":
      return <ProfileTab user={user} onNicknameChange={onNicknameChange} />;
    case "data":
      return <DataTab />;
    case "app-info":
      return <AppInfoTab />;
    case "account":
      return <AccountTab user={user} />;
  }
}

// --- 설정 모달 ---
interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [user, setUser] = useState<DummyUser>(INITIAL_USER);

  const content = (
    <TabContent
      activeTab={activeTab}
      user={user}
      onNicknameChange={(nickname) =>
        setUser((prev) => ({ ...prev, nickname }))
      }
    />
  );

  // 모바일: Sheet (하단 슬라이드) + 상단 가로 탭
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        {/* style={{ height: "90vh" }} — data-[side=bottom]:h-auto 우선순위 충돌 방지 */}
        <SheetContent
          side="bottom"
          className="gap-0 p-0"
          style={{ height: "90vh" }}
        >
          <SheetHeader className="shrink-0 border-b px-4 py-4">
            <SheetTitle>설정</SheetTitle>
          </SheetHeader>

          {/* 상단 가로 탭 네비 */}
          <div className="flex shrink-0 border-b">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`flex-1 border-b-2 py-2.5 text-xs font-medium transition-colors ${
                  activeTab === tab.id
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.mobileLabel}
              </button>
            ))}
          </div>

          {/* 스크롤 가능한 컨텐츠 */}
          <div className="flex-1 overflow-y-auto p-4">{content}</div>
        </SheetContent>
      </Sheet>
    );
  }

  // 데스크톱: Dialog + 좌측 탭 네비
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="overflow-hidden p-0 sm:max-w-3xl"
        showCloseButton={false}
      >
        <div className="flex h-[80vh]">
          {/* 좌측 탭 네비 */}
          <div className="flex w-48 shrink-0 flex-col border-r">
            <div className="shrink-0 border-b px-4 py-4">
              <p className="text-sm font-semibold">설정</p>
            </div>
            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    activeTab === tab.id
                      ? "bg-accent font-medium text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* 우측 컨텐츠 */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* 섹션 헤더 + 닫기 버튼 */}
            <div className="flex shrink-0 items-center justify-between border-b px-6 py-4">
              <p className="text-base font-semibold">
                {TABS.find((t) => t.id === activeTab)?.label}
              </p>
              <DialogClose
                render={<Button variant="ghost" size="icon-sm" />}
              >
                <X className="size-4" />
                <span className="sr-only">닫기</span>
              </DialogClose>
            </div>

            {/* 스크롤 가능한 컨텐츠 */}
            <div className="flex-1 overflow-y-auto p-6">{content}</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// --- 페이지 진입 UI ---
export default function SettingsModalShowcasePage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Button onClick={() => setOpen(true)}>설정 모달 열기</Button>
      <SettingsModal open={open} onOpenChange={setOpen} />
    </div>
  );
}
