import type { JSONContent } from "@tiptap/react";

/**
 * Tiptap JSON 콘텐츠에서 텍스트를 재귀적으로 추출합니다.
 *
 * @param node - Tiptap JSON 노드
 * @returns 추출된 텍스트
 */
function extractText(node: JSONContent): string {
  if (node.text) {
    return node.text;
  }

  if (node.content) {
    return node.content.map(extractText).join("");
  }

  return "";
}

/**
 * Tiptap JSON 콘텐츠에서 미리보기 텍스트를 추출합니다.
 *
 * @param content - Tiptap JSON 콘텐츠
 * @param maxLength - 최대 길이 (기본값: 30)
 * @returns 텍스트 미리보기 (초과 시 "..." 추가)
 *
 * @example
 * ```ts
 * const preview = extractPreview(content, 30);
 * // "반도체 업황 회복 기대..."
 * ```
 */
export function extractPreview(content: JSONContent, maxLength = 30): string {
  const text = extractText(content).trim();

  if (text.length <= maxLength) {
    return text;
  }

  return text.slice(0, maxLength) + "...";
}

/**
 * Tiptap JSON 콘텐츠의 텍스트 길이를 계산합니다.
 *
 * @param content - Tiptap JSON 콘텐츠
 * @returns 텍스트 길이
 */
export function getTextLength(content: JSONContent): number {
  return extractText(content).trim().length;
}
