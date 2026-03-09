import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";

/**
 * 기본 에디터 확장 조합을 생성합니다.
 *
 * @param placeholder - 빈 상태 플레이스홀더 텍스트
 * @returns Tiptap 확장 배열
 */
export function createDefaultExtensions(
  placeholder = "메모를 작성해보세요..."
) {
  return [
    StarterKit,
    Link.configure({
      openOnClick: false,
      autolink: true,
    }),
    Placeholder.configure({
      placeholder,
    }),
  ];
}
