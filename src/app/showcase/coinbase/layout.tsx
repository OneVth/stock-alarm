import { Noto_Sans_KR } from "next/font/google";
import "./coinbase.css";

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-sans-kr",
  display: "swap",
});

/**
 * Coinbase Showcase 레이아웃.
 *
 * children을 `[data-style="coinbase"]` 스코프로 감싸서 coinbase.css에 정의된
 * CSS 변수 오버라이드가 descendants에만 적용되게 한다. 부모
 * `src/app/showcase/layout.tsx`의 ShowcaseNav는 이 wrapper 바깥에 남아
 * 기본 showcase 테마를 유지한다.
 */
export default function CoinbaseShowcaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      data-style="coinbase"
      className={`-mx-4 -my-8 min-h-[calc(100vh-4rem)] bg-background text-foreground ${notoSansKR.variable}`}
    >
      <div className="px-4 py-8">{children}</div>
    </div>
  );
}
