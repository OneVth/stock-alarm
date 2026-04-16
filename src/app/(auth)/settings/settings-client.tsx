"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { PencilIcon } from "lucide-react";
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

      <div className="w-full max-w-2xl">
        <Card>
          <CardContent className="px-12 pt-12 pb-8">
            <p className="mb-10 text-lg font-semibold leading-snug tracking-[-0.01em]">내 프로필</p>

            {/* 이미지 */}
            <div className="mb-10 flex items-start gap-4">
              <span className="w-16 shrink-0 text-sm text-muted-foreground">
                이미지
              </span>
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
            <div className="mb-10 flex items-center gap-4">
              <span className="w-16 shrink-0 text-sm text-muted-foreground">
                이메일
              </span>
              <span className="text-base">{user.email}</span>
            </div>

            {/* 닉네임 — 읽기/편집 모드 */}
            <div className="flex items-center gap-4">
              <label htmlFor="nickname-input" className="w-16 shrink-0 text-sm text-muted-foreground">
                닉네임
              </label>
              {!isEditing ? (
                <>
                  <span className="text-base">{nicknameVal}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <PencilIcon className="size-3.5" />
                    수정
                  </Button>
                </>
              ) : (
                <>
                  <Input
                    id="nickname-input"
                    value={nicknameVal}
                    onChange={(e) => setNicknameVal(e.target.value)}
                    maxLength={20}
                    className="max-w-48"
                  />
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
                </>
              )}
            </div>

            {/* 구분선 + 계정 삭제 */}
            <div className="mt-16 border-t pt-10">
              <div className="flex justify-end">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDialogOpen(true)}
                >
                  계정 삭제
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
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
