"use client";

import { useEditor } from "@tiptap/react";
import type { JSONContent } from "@tiptap/react";
import { createDefaultExtensions } from "../config/extensions";

/** useTiptapEditor 옵션 */
interface UseTiptapEditorOptions {
  /** 초기 콘텐츠 (Tiptap JSON 형식) */
  content?: JSONContent;
  /** 편집 가능 여부 (기본값: true) */
  editable?: boolean;
  /** 빈 상태 플레이스홀더 */
  placeholder?: string;
  /** 콘텐츠 변경 시 호출 */
  onUpdate?: (content: JSONContent) => void;
}

/**
 * Tiptap 에디터 인스턴스를 생성하고 관리합니다.
 *
 * @param options - 에디터 옵션
 * @returns 에디터 인스턴스
 *
 * @example
 * ```tsx
 * const editor = useTiptapEditor({
 *   content: initialContent,
 *   onUpdate: (json) => setContent(json),
 * });
 * ```
 */
export function useTiptapEditor({
  content,
  editable = true,
  placeholder,
  onUpdate,
}: UseTiptapEditorOptions = {}) {
  const editor = useEditor({
    extensions: createDefaultExtensions(placeholder),
    content,
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onUpdate?.(editor.getJSON());
    },
  });

  return editor;
}
