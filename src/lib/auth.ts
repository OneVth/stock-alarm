import NextAuth, { type DefaultSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { handleSignIn } from "@/lib/auth-callbacks";
import { authConfig } from "@/lib/auth.config";

/**
 * NextAuth.js 타입 확장
 *
 * 세션에 사용자 ID와 역할 배열을 포함합니다.
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      roles: string[];
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    roles: string[];
  }
}

export { handleSignIn } from "@/lib/auth-callbacks";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    signIn: handleSignIn,

    async jwt({ token, user, account }) {
      if (account && user) {
        // 최초 로그인 시 DB에서 역할 조회
        const dbUser = await prisma.user.findUnique({
          where: { googleId: account.providerAccountId },
          include: { userRoles: { include: { role: true } } },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.roles = dbUser.userRoles.map((ur) => ur.role.name);
        }
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id;
      session.user.roles = token.roles;
      return session;
    },
  },
});
