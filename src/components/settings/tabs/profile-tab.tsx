"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PencilIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ProfileTabProps {
  /** 사용자 정보 */
  user: {
    email: string;
    nickname: string | null;
    image: string | null;
  };
}

export function ProfileTab({ user }: ProfileTabProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [nicknameVal, setNicknameVal] = useState(user.nickname ?? "");
  const [isSaving, setIsSaving] = useState(false);

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

  function handleCancel() {
    setNicknameVal(user.nickname ?? "");
    setIsEditing(false);
  }

  const fallbackChar = (user.nickname ?? user.email).charAt(0).toUpperCase();

  return (
    <div className="space-y-6">
      <h2 className="text-[18px] font-bold">프로필</h2>

      {/* 아바타 */}
      <div>
        <Avatar className="size-16">
          {user.image && (
            <AvatarImage src={user.image} alt={user.nickname ?? ""} />
          )}
          <AvatarFallback className="text-[18px]">{fallbackChar}</AvatarFallback>
        </Avatar>
      </div>

      {/* 이메일 */}
      <div className="space-y-1">
        <p className="text-[14px] font-medium">이메일</p>
        <p className="text-[14px] text-muted-foreground">{user.email}</p>
      </div>

      {/* 닉네임 */}
      <div className="space-y-1">
        <label
          htmlFor="nickname-input"
          className="block text-[14px] font-medium"
        >
          닉네임
        </label>
        <div className="flex flex-wrap items-center justify-between gap-2">
          {!isEditing ? (
            <p className="text-[14px] text-muted-foreground">{nicknameVal}</p>
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
                  nicknameVal === (user.nickname ?? "")
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
