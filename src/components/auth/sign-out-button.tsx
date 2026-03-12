import { signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";

/**
 * 로그아웃 버튼 (Server Component)
 *
 * 서버 액션으로 로그아웃을 처리하고 로그인 페이지로 리다이렉트합니다.
 */
export function SignOutButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/login" });
      }}
    >
      <Button variant="ghost" size="sm" type="submit">
        로그아웃
      </Button>
    </form>
  );
}
