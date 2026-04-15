import "./apple.css";

/**
 * Apple Showcase 레이아웃.
 *
 * children을 `[data-style="apple"]` 스코프로 감싸서 apple.css에 정의된
 * CSS 변수 오버라이드가 descendants에만 적용되게 한다. 부모
 * `src/app/showcase/layout.tsx`의 ShowcaseNav는 이 wrapper 바깥에 남아
 * 기본 showcase 테마를 유지한다.
 */
export default function AppleShowcaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      data-style="apple"
      className="-mx-4 -my-8 min-h-[calc(100vh-4rem)] bg-background text-foreground"
    >
      <div className="px-4 py-8">{children}</div>
    </div>
  );
}
