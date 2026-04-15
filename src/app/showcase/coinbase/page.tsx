import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const categories = [
  {
    href: "/showcase/coinbase/layout",
    title: "Layout & Structure",
    description: "Card, Separator, Aspect Ratio, Scroll Area, Resizable, Collapsible",
    count: 6,
  },
  {
    href: "/showcase/coinbase/navigation",
    title: "Navigation",
    description: "Breadcrumb, Tabs, Pagination, Menubar, Command",
    count: 5,
  },
  {
    href: "/showcase/coinbase/forms",
    title: "Data Input / Forms",
    description:
      "Button, Input, Label, Textarea, Select, Checkbox, Radio Group, Switch, Toggle, Toggle Group, Slider, Calendar, Date Picker, Input OTP",
    count: 14,
  },
  {
    href: "/showcase/coinbase/display",
    title: "Data Display",
    description: "Table, Avatar, Badge, Accordion, Carousel, Chart",
    count: 6,
  },
  {
    href: "/showcase/coinbase/feedback",
    title: "Feedback & Status",
    description: "Alert, Alert Dialog, Toast (Sonner), Progress, Spinner, Skeleton",
    count: 6,
  },
  {
    href: "/showcase/coinbase/overlay",
    title: "Overlay & Popup",
    description:
      "Dialog, Sheet, Popover, Tooltip, Dropdown Menu, Context Menu, Hover Card",
    count: 7,
  },
  {
    href: "/showcase/coinbase/prototype",
    title: "Prototype",
    description: "페이지 구성 예시 — 대시보드, 종목 상세, 설정, 테이블, 로그인, 전체 레이아웃",
    count: 6,
  },
];

export default function CoinbaseShowcasePage() {
  return (
    <div className="space-y-16">
      <header className="pt-8 pb-4">
        <p className="cb-caption text-muted-foreground">Coinbase Style</p>
        <h1 className="cb-hero mt-2">Showcase.</h1>
        <p className="cb-body mt-6 max-w-xl text-muted-foreground">
          Coinbase 디자인 시스템을 적용한 컴포넌트 쇼케이스. 동일한 컴포넌트 데모를
          Coinbase의 색상, 타이포그래피, 간격 체계로 재현합니다.
        </p>
        <div className="mt-8 flex items-center gap-4">
          <Link
            href="/showcase/coinbase/prototype"
            className="cb-cta cb-btn-label"
          >
            Prototype 보기
          </Link>
          <Link href="/showcase" className="cb-link cb-body">
            Default 쇼케이스로 돌아가기 →
          </Link>
        </div>
      </header>

      <section>
        <h2 className="cb-section">Categories</h2>
        <p className="cb-body mt-2 text-muted-foreground">
          shadcn/ui 컴포넌트 44종을 6개 카테고리로 구성했습니다.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map(({ href, title, description, count }) => (
            <Link key={href} href={href}>
              <Card className="h-full transition-colors hover:bg-accent">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="cb-body-sm font-semibold">{title}</CardTitle>
                    <span className="cb-caption text-muted-foreground">
                      {count}
                    </span>
                  </div>
                  <CardDescription className="cb-caption line-clamp-2">
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
