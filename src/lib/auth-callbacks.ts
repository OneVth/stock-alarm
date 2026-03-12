import { prisma } from "@/lib/prisma";

/**
 * signIn 콜백 핸들러.
 *
 * Google OAuth 로그인 시 사용자 조회/생성 및 역할 부여를 처리합니다.
 * - googleId로 기존 사용자 확인
 * - 이메일로 기존 사용자 확인 후 googleId 연동
 * - 신규 사용자 생성 + user 역할 부여 (ADMIN_EMAILS에 포함 시 admin 역할도 부여)
 *
 * @param params - NextAuth signIn 콜백 파라미터
 * @returns 로그인 허용 여부
 */
export async function handleSignIn({
  user,
  account,
}: {
  user: { email?: string | null; name?: string | null; image?: string | null };
  account?: { provider: string; providerAccountId: string } | null;
}): Promise<boolean> {
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
}
