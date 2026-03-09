"use client";

import type { JSONContent } from "@tiptap/react";
import { EditorContent } from "@tiptap/react";
import { cn } from "@/lib/utils";
import { useTiptapEditor } from "./hooks/use-tiptap-editor";

/**
 * Tiptap 뷰어 Props
 */
interface TiptapViewerProps {
  /** 표시할 콘텐츠 (Tiptap JSON 형식) */
  content: JSONContent;
  /** 뷰어 클래스명 */
  className?: string;
}

/**
 * Tiptap 읽기 전용 뷰어 컴포넌트
 *
 * @param props - 뷰어 속성
 *
 * @example
 * ```tsx
 * <TiptapViewer content={savedContent} />
 * ```
 */
export function TiptapViewer({ content, className }: TiptapViewerProps) {
  const editor = useTiptapEditor({
    content,
    editable: false,
  });

  if (!editor) {
    return null;
  }

  return (
    <div className={cn("tiptap-viewer", className)}>
      <EditorContent editor={editor} />
    </div>
  );
}
