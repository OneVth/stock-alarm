"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, Pencil } from "lucide-react";
import { toast } from "sonner";
import type { JSONContent } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { TiptapEditor, TiptapViewer } from "@/components/editor";
import type { Alert } from "@/generated/prisma/client";

/**
 * 메모 섹션 Props
 */
interface MemoSectionProps {
  /** 알림 데이터 */
  alert: Alert;
}

/**
 * 메모 섹션 컴포넌트
 *
 * 기본 접힘 상태로 시작하며, 펼치면 TiptapViewer로 내용을 표시합니다.
 * 수정 버튼 클릭 시 TiptapEditor로 전환하여 저장/취소할 수 있습니다.
 */
export function MemoSection({ alert }: MemoSectionProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editContent, setEditContent] = useState<JSONContent | undefined>(
    alert.memo ? (alert.memo as JSONContent) : undefined,
  );

  const hasMemo = !!alert.memo;

  const handleCancel = useCallback(() => {
    setEditContent(alert.memo ? (alert.memo as JSONContent) : undefined);
    setIsEditing(false);
  }, [alert.memo]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/alerts/${alert.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memo: editContent }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "메모 저장에 실패했습니다");
        return;
      }

      toast.success("메모가 저장되었습니다");
      setIsEditing(false);
      router.refresh();
    } catch {
      toast.error("네트워크 오류가 발생했습니다");
    } finally {
      setSaving(false);
    }
  }, [alert.id, editContent, router]);

  return (
    <div className="border-t pt-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full">
          <div className="flex cursor-pointer items-center justify-between py-1 hover:opacity-70">
            <p className="font-medium">메모</p>
            {isOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-3">
            <div className="mb-3 flex items-center justify-between">
              <span />
              {isEditing ? (
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSave} disabled={saving}>
                    {saving ? "저장 중..." : "저장"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    취소
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="mr-1.5 h-3.5 w-3.5" />
                  수정
                </Button>
              )}
            </div>

            {isEditing ? (
              <TiptapEditor
                content={editContent}
                onChange={(c) => setEditContent(c)}
                placeholder="메모를 입력하세요..."
              />
            ) : hasMemo ? (
              <div className="rounded-lg bg-muted/30 p-4">
                <TiptapViewer content={alert.memo as JSONContent} />
              </div>
            ) : (
              <div className="rounded-lg bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">메모가 없습니다</p>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
