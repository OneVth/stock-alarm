import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AuthHeader } from "@/components/layout/auth-header";

/**
 * 인증 필수 영역 레이아웃
 *
 * 미들웨어에서 1차 보호하고, 여기서 defense in depth로 세션을 재검증합니다.
 */
export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <>
      <AuthHeader />
      <main className="container mx-auto max-w-5xl px-4 py-6">
        {children}
      </main>
    </>
  );
}
