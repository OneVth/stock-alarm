import Image from "next/image";
import { redirect } from "next/navigation";
import { BellPlus, CalendarCheck, MailCheck } from "lucide-react";
import { auth, signIn } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { LandingLoginDialog } from "@/components/landing/landing-login-dialog";

const features = [
  {
    icon: BellPlus,
    title: "간편한 알림 설정",
    description: "종목을 등록하고 상승/하락 임계값만 설정하면 준비 끝",
  },
  {
    icon: CalendarCheck,
    title: "매일 자동 체크",
    description: "매일 시장을 확인해서 설정한 조건에 도달했는지 체크합니다",
  },
  {
    icon: MailCheck,
    title: "이메일 알림",
    description: "조건 충족 시 이메일로 알려드립니다",
  },
];

export default async function Home() {
  const session = await auth();
  if (session) redirect("/dashboard");

  async function loginAction() {
    "use server";
    await signIn("google", { redirectTo: "/dashboard" });
  }

  return (
    <div className="relative flex min-h-screen flex-col before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:[background-image:linear-gradient(to_right,color-mix(in_srgb,var(--border)_70%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_srgb,var(--border)_70%,transparent)_1px,transparent_1px)] before:[background-size:240px_240px] before:[mask-image:linear-gradient(to_bottom,black_0%,transparent_80%)]">
      <Header
        loginSlot={
          <LandingLoginDialog
            loginAction={loginAction}
            trigger={<Button variant="outline" size="sm">로그인</Button>}
          />
        }
      />

      <main>
        {/* Hero 섹션 */}
        <section className="px-4 py-20">
          <div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-8 md:grid-cols-[3fr_2fr]">
            {/* 좌측: 텍스트 + CTA */}
            <div className="flex flex-col gap-4 md:pb-20">
              <h1 className="text-2xl font-bold leading-snug tracking-[-0.01em] md:text-4xl md:leading-none md:tracking-[-0.02em]">
                매일 확인하지 않아도 괜찮아요
              </h1>
              <p className="text-lg text-muted-foreground">
                종목을 등록하고 알림 조건만 설정하면, 나머지는 Stock Alarm이 알아서
              </p>
              <div>
                <LandingLoginDialog
                  loginAction={loginAction}
                  trigger={
                    <Button size="lg" className="h-12 px-16">
                      시작하기
                    </Button>
                  }
                />
              </div>
            </div>

            {/* 우측: 스마트폰 목업 */}
            <div className="flex justify-center">
              <Image
                src="/images/Isolated_Smartphone_Mockup.png"
                alt="Stock Alarm 모바일 화면"
                width={500}
                height={800}
                className="max-w-sm"
                priority
              />
            </div>
          </div>
        </section>

        {/* 기능 소개 섹션 */}
        <section className="px-4 py-16">
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex flex-col items-center gap-3 rounded-lg border p-6 text-center"
              >
                <feature.icon className="h-8 w-8 text-primary" />
                <h3 className="text-lg font-semibold leading-snug tracking-[-0.01em]">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © 2026 Stock Alarm
      </footer>
    </div>
  );
}
