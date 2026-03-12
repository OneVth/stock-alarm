import type { JSONContent } from "@tiptap/react";

/**
 * Prisma Json 타입에서 텍스트를 재귀적으로 추출합니다.
 *
 * @param node - Tiptap JSON 노드
 * @returns 추출된 텍스트
 */
function extractTextFromNode(node: Record<string, unknown>): string {
  if (typeof node["text"] === "string") {
    return node["text"];
  }

  if (Array.isArray(node["content"])) {
    return (node["content"] as Record<string, unknown>[])
      .map(extractTextFromNode)
      .join("");
  }

  return "";
}

/**
 * Prisma Json 타입의 메모에서 플레인 텍스트를 추출합니다.
 *
 * @param memo - Prisma Json 필드 (Tiptap JSON 콘텐츠)
 * @returns 추출된 텍스트
 *
 * @example
 * ```ts
 * const text = extractPlainText(alert.memo);
 * ```
 */
export function extractPlainText(memo: unknown): string {
  if (!memo || typeof memo !== "object") return "";
  return extractTextFromNode(memo as Record<string, unknown>).trim();
}

/**
 * 메모에서 미리보기 텍스트를 추출합니다.
 *
 * @param memo - Prisma Json 필드 (Tiptap JSON 콘텐츠)
 * @param maxLength - 최대 길이 (기본값: 30)
 * @returns 텍스트 미리보기 (초과 시 "..." 추가)
 *
 * @example
 * ```ts
 * const preview = extractPreview(alert.memo, 30);
 * // "반도체 업황 회복 기대..."
 * ```
 */
export function extractMemoPreview(
  memo: unknown,
  maxLength = 30
): string {
  const text = extractPlainText(memo);

  if (text.length <= maxLength) {
    return text;
  }

  return text.slice(0, maxLength) + "...";
}
