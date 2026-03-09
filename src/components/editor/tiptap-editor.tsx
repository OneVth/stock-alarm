"use client";

import type { JSONContent } from "@tiptap/react";
import { EditorContent } from "@tiptap/react";
import { cn } from "@/lib/utils";
import { useTiptapEditor } from "./hooks/use-tiptap-editor";
import { Toolbar } from "./toolbar/toolbar";

/**
 * Tiptap 에디터 Props
 */
interface TiptapEditorProps {
  /** 초기 콘텐츠 (Tiptap JSON 형식) */
  content?: JSONContent;
  /** 편집 가능 여부 */
  editable?: boolean;
  /** 빈 상태 플레이스홀더 */
  placeholder?: string;
  /** 콘텐츠 변경 시 호출 */
  onChange?: (content: JSONContent) => void;
  /** 에디터 클래스명 */
  className?: string;
}

/**
 * Tiptap 리치 텍스트 에디터 컴포넌트
 *
 * @param props - 에디터 속성
 *
 * @example
 * ```tsx
 * <TiptapEditor
 *   content={content}
 *   onChange={(json) => setContent(json)}
 *   placeholder="메모를 작성해보세요..."
 * />
 * ```
 */
export function TiptapEditor({
  content,
  editable = true,
  placeholder,
  onChange,
  className,
}: TiptapEditorProps) {
  const editor = useTiptapEditor({
    content,
    editable,
    placeholder,
    onUpdate: onChange,
  });

  if (!editor) {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-lg border bg-background",
        "focus-within:ring-2 focus-within:ring-ring/50",
        className
      )}
    >
      {editable && <Toolbar editor={editor} />}
      <EditorContent editor={editor} className="tiptap-editor" />
    </div>
  );
}
