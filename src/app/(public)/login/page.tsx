import { redirect } from "next/navigation";
import { auth, signIn } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { GoogleIcon } from "@/components/icons/google";

export default async function LoginPage() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-muted/50">
      <div className="absolute top-4 right-4">
        <ThemeSwitcher />
      </div>
      <Card className="w-full max-w-xl">
        <CardHeader className="p-8 pb-8">
          <CardTitle className="text-2xl font-bold">Stock Alarm</CardTitle>
          <CardDescription className="text-base">
            Google 계정으로 로그인하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-4">
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/dashboard" });
            }}
          >
            <Button type="submit" variant="outline" className="w-full gap-2 h-12">
              <GoogleIcon className="h-5 w-5" />
                <div className="text-base">Google로 로그인</div>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
