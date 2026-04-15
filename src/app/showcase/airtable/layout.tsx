import { IBM_Plex_Sans_KR } from "next/font/google";
import "./airtable.css";

const ibmPlexKR = IBM_Plex_Sans_KR({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex-kr",
  display: "swap",
});

/**
 * Airtable Showcase 레이아웃.
 *
 * children을 `[data-style="airtable"]` 스코프로 감싸서 airtable.css에 정의된
 * CSS 변수 오버라이드가 descendants에만 적용되게 한다. 부모
 * `src/app/showcase/layout.tsx`의 ShowcaseNav는 이 wrapper 바깥에 남아
 * 기본 showcase 테마를 유지한다. IBM Plex Sans KR 폰트 변수는 이 wrapper에만
 * 적용되어 나머지 페이지에 영향을 주지 않는다.
 */
export default function AirtableShowcaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      data-style="airtable"
      className={`-mx-4 -my-8 min-h-[calc(100vh-4rem)] bg-background text-foreground ${ibmPlexKR.variable}`}
    >
      <div className="px-4 py-8">{children}</div>
    </div>
  );
}
