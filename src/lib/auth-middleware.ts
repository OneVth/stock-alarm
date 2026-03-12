/**
 * 미들웨어 라우트 보호 결과 타입
 */
export type AuthRedirectResult =
  | { type: "pass" }
  | { type: "redirect"; destination: string }
  | { type: "rewrite-404" };

/**
 * 인증 상태와 역할에 따른 라우트 보호 로직을 결정합니다.
 *
 * Edge Runtime 미들웨어에서 사용할 수 있도록 순수 함수로 분리되었습니다.
 *
 * @param pathname - 요청 경로
 * @param isLoggedIn - 로그인 여부
 * @param roles - 사용자 역할 배열
 * @param nodeEnv - NODE_ENV 값
 * @returns 리다이렉트 결과
 */
export function resolveAuthRedirect(
  pathname: string,
  isLoggedIn: boolean,
  roles: string[],
  nodeEnv: string = "production"
): AuthRedirectResult {
  // /login: 로그인 상태면 대시보드로 리다이렉트
  if (pathname === "/login") {
    if (isLoggedIn) {
      return { type: "redirect", destination: "/dashboard" };
    }
    return { type: "pass" };
  }

  // /dashboard/*: 비로그인 시 로그인 페이지로
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    if (!isLoggedIn) {
      return { type: "redirect", destination: "/login" };
    }
    return { type: "pass" };
  }

  // /settings: 비로그인 시 로그인 페이지로
  if (pathname === "/settings") {
    if (!isLoggedIn) {
      return { type: "redirect", destination: "/login" };
    }
    return { type: "pass" };
  }

  // /admin/*: 비로그인 → /login, 로그인(non-admin) → /dashboard, admin → 통과
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (!isLoggedIn) {
      return { type: "redirect", destination: "/login" };
    }
    if (!roles.includes("admin")) {
      return { type: "redirect", destination: "/dashboard" };
    }
    return { type: "pass" };
  }

  // /showcase/*: 프로덕션에서는 404
  if (pathname === "/showcase" || pathname.startsWith("/showcase/")) {
    if (nodeEnv === "production") {
      return { type: "rewrite-404" };
    }
    return { type: "pass" };
  }

  // 기타: 통과
  return { type: "pass" };
}
