import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * API 라우트에서 admin 권한을 검증합니다.
 *
 * @returns 세션 또는 에러 응답
 *
 * @example
 * ```ts
 * const result = await requireAdmin();
 * if ("error" in result) return result.error;
 * const { session } = result;
 * ```
 */
export async function requireAdmin() {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (!session.user.roles?.includes("admin")) {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { session };
}
