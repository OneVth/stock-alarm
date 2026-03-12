import NextAuth, { type DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

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

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  session: { strategy: "jwt" },
  // pages: {
  //   signIn: "/login",
  // },
  callbacks: {
    async signIn({ user, account }) {
      // Google 프로바이더만 허용
      if (account?.provider !== "google") return false;

      const email = user.email;
      const googleId = account.providerAccountId;
      if (!email || !googleId) return false;

      // 1. googleId로 기존 사용자 확인
      const existingByGoogleId = await prisma.user.findUnique({
        where: { googleId },
      });
      if (existingByGoogleId) return true;

      // 2. 이메일로 기존 사용자 확인 (googleId 미연동)
      const existingByEmail = await prisma.user.findUnique({
        where: { email },
      });
      if (existingByEmail) {
        await prisma.user.update({
          where: { email },
          data: { googleId },
        });
        return true;
      }

      // 3. 신규 사용자: User 생성 + 역할 부여
      const userRole = await prisma.role.findUnique({
        where: { name: "user" },
      });
      if (!userRole) return false;

      const adminEmails = (process.env.ADMIN_EMAILS ?? "")
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean);
      const isAdmin = adminEmails.includes(email);

      const roleConnections: { roleId: string }[] = [{ roleId: userRole.id }];

      if (isAdmin) {
        const adminRole = await prisma.role.findUnique({
          where: { name: "admin" },
        });
        if (adminRole) {
          roleConnections.push({ roleId: adminRole.id });
        }
      }

      await prisma.user.create({
        data: {
          email,
          nickname: user.name ?? email.split("@")[0],
          image: user.image,
          googleId,
          userRoles: {
            create: roleConnections,
          },
        },
      });

      return true;
    },

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
