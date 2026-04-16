"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { PencilIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SettingsClientProps {
  user: {
    id: string;
    email: string;
    nickname: string;
    image: string | null;
  };
}

export function SettingsClient({ user }: SettingsClientProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [nicknameVal, setNicknameVal] = useState(user.nickname);
  const [isSaving, setIsSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    const res = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nickname: nicknameVal }),
    });
    if (res.ok) {
      toast("닉네임이 변경되었습니다");
      router.refresh();
      setIsEditing(false);
    } else {
      const data = await res.json();
      toast.error(data.error ?? "오류가 발생했습니다");
    }
    setIsSaving(false);
  }

  async function handleDelete() {
    setIsDeleting(true);
    const res = await fetch("/api/user/account", { method: "DELETE" });
    if (res.ok) {
      await signOut({ redirectTo: "/login" });
    } else {
      const data = await res.json();
      toast.error(data.error ?? "오류가 발생했습니다");
      setIsDeleting(false);
      setDialogOpen(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold leading-snug tracking-[-0.01em]">설정</h1>

      <div className="w-full max-w-2xl space-y-6">
        {/* 프로필 카드 */}
        <Card>
          <CardContent className="p-6">
            <p className="mb-6 text-lg font-semibold leading-snug tracking-[-0.01em]">내 프로필</p>

            <div className="space-y-6">
              {/* 이미지 */}
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

              {/* 이메일 */}
              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">이메일</p>
                <p className="text-base">{user.email}</p>
              </div>

              {/* 닉네임 — 읽기/편집 모드 */}
              <div>
                <label
                  htmlFor="nickname-input"
                  className="mb-1 block text-xs font-medium text-muted-foreground"
                >
                  닉네임
                </label>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  {!isEditing ? (
                    <p className="text-base">{nicknameVal}</p>
                  ) : (
                    <Input
                      id="nickname-input"
                      value={nicknameVal}
                      onChange={(e) => setNicknameVal(e.target.value)}
                      maxLength={20}
                      className="w-full max-w-sm"
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setNicknameVal(user.nickname);
                          setIsEditing(false);
                        }}
                      >
                        취소
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 계정 섹션 */}
        <div>
          <p className="mb-3 text-sm font-semibold text-muted-foreground px-1">
            계정
          </p>
          <Card>
            <CardContent className="overflow-hidden p-0">
              <button
                type="button"
                className="flex w-full items-center gap-3 px-4 py-3 min-h-[44px] text-left transition-colors hover:bg-destructive/5"
                onClick={() => setDialogOpen(true)}
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-destructive/10">
                  <Trash2 className="size-4 text-destructive" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-destructive">계정 삭제</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">모든 데이터 영구 삭제</p>
                </div>
              </button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 삭제 확인 Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>계정 삭제</DialogTitle>
            <DialogDescription>
              정말 삭제하시겠습니까? 모든 알림, 이력, 메모가 영구적으로
              삭제되며 복구할 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={isDeleting}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
