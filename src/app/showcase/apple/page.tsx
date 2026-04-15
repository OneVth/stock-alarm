import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const categories = [
  {
    href: "/showcase/apple/layout",
    title: "Layout & Structure",
    description: "Card, Separator, Aspect Ratio, Scroll Area, Resizable, Collapsible",
    count: 6,
  },
  {
    href: "/showcase/apple/navigation",
    title: "Navigation",
    description: "Breadcrumb, Tabs, Pagination, Menubar, Command",
    count: 5,
  },
  {
    href: "/showcase/apple/forms",
    title: "Data Input / Forms",
    description:
      "Button, Input, Label, Textarea, Select, Checkbox, Radio Group, Switch, Toggle, Toggle Group, Slider, Calendar, Date Picker, Input OTP",
    count: 14,
  },
  {
    href: "/showcase/apple/display",
    title: "Data Display",
    description: "Table, Avatar, Badge, Accordion, Carousel, Chart",
    count: 6,
  },
  {
    href: "/showcase/apple/feedback",
    title: "Feedback & Status",
    description: "Alert, Alert Dialog, Toast (Sonner), Progress, Spinner, Skeleton",
    count: 6,
  },
  {
    href: "/showcase/apple/overlay",
    title: "Overlay & Popup",
    description:
      "Dialog, Sheet, Popover, Tooltip, Dropdown Menu, Context Menu, Hover Card",
    count: 7,
  },
  {
    href: "/showcase/apple/prototype",
    title: "Prototype",
    description: "페이지 구성 예시 — 대시보드, 종목 상세, 설정, 테이블, 로그인, 전체 레이아웃",
    count: 6,
  },
];

export default function AppleShowcasePage() {
  return (
    <div className="space-y-16">
      <header className="pt-8 pb-4">
        <p className="apple-caption text-muted-foreground">Apple Style</p>
        <h1 className="apple-display mt-2">Showcase.</h1>
        <p className="apple-body mt-4 max-w-xl text-muted-foreground">
          Apple 디자인 시스템을 적용한 컴포넌트 쇼케이스. 동일한 컴포넌트 데모를
          Apple의 색상, 타이포그래피, 간격 체계로 재현합니다.
        </p>
        <div className="mt-8 flex items-center gap-4">
          <Link
            href="/showcase/apple/prototype"
            className="apple-cta apple-body bg-primary text-primary-foreground inline-flex items-center font-medium transition-opacity hover:opacity-90"
          >
            Prototype 보기
          </Link>
          <Link href="/showcase" className="apple-link apple-body">
            Default 쇼케이스로 돌아가기 →
          </Link>
        </div>
      </header>

      <section>
        <h2 className="apple-section">Categories</h2>
        <p className="apple-body mt-2 text-muted-foreground">
          shadcn/ui 컴포넌트 44종을 6개 카테고리로 구성했습니다.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map(({ href, title, description, count }) => (
            <Link key={href} href={href}>
              <Card className="h-full transition-colors hover:bg-accent">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{title}</CardTitle>
                    <span className="apple-caption text-muted-foreground">
                      {count}
                    </span>
                  </div>
                  <CardDescription className="apple-caption line-clamp-2">
                    {description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
