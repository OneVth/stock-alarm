import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

/**
 * NextAuth 기본 설정 (Prisma 미포함)
 *
 * Edge Runtime(미들웨어)에서 안전하게 사용할 수 있도록
 * Node.js 전용 모듈(Prisma)을 포함하지 않습니다.
 * 전체 설정은 `auth.ts`에서 이 설정을 확장합니다.
 */
export const authConfig = {
  providers: [Google],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
} satisfies NextAuthConfig;
