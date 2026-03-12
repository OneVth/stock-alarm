"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

/**
 * NextAuth 세션 프로바이더 래퍼
 *
 * 클라이언트 컴포넌트에서 `useSession()` 훅을 사용할 수 있게 합니다.
 */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
