import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AppSidebar } from "@/components/layout/app-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";

/**
 * 인증 필수 영역 레이아웃
 *
 * 미들웨어에서 1차 보호하고, 여기서 defense in depth로 세션을 재검증합니다.
 * 사이드바 네비게이션 + 메인 콘텐츠 영역으로 구성됩니다.
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

  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b px-4 md:hidden">
          <SidebarTrigger />
          <span className="text-lg font-semibold">Stock Alarm</span>
        </header>
        <div className="flex-1 px-4 py-6 md:px-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
