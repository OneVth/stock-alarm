import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const categories = [
  {
    href: "/showcase/layout",
    title: "Layout & Structure",
    description: "Card, Separator, Aspect Ratio, Scroll Area, Resizable, Collapsible",
    count: 6,
  },
  {
    href: "/showcase/navigation",
    title: "Navigation",
    description: "Breadcrumb, Tabs, Pagination, Menubar, Command",
    count: 5,
  },
  {
    href: "/showcase/forms",
    title: "Data Input / Forms",
    description: "Button, Input, Label, Textarea, Select, Checkbox, Radio Group, Switch, Toggle, Toggle Group, Slider, Calendar, Date Picker, Input OTP",
    count: 14,
  },
  {
    href: "/showcase/display",
    title: "Data Display",
    description: "Table, Avatar, Badge, Accordion, Carousel, Chart",
    count: 6,
  },
  {
    href: "/showcase/feedback",
    title: "Feedback & Status",
    description: "Alert, Alert Dialog, Toast (Sonner), Progress, Spinner, Skeleton",
    count: 6,
  },
  {
    href: "/showcase/overlay",
    title: "Overlay & Popup",
    description: "Dialog, Sheet, Popover, Tooltip, Dropdown Menu, Context Menu, Hover Card",
    count: 7,
  },
];

export default function ShowcasePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">UI Component Showcase</h1>
        <p className="mt-2 text-muted-foreground">
          shadcn/ui 44 components across 6 categories
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map(({ href, title, description, count }) => (
          <Link key={href} href={href}>
            <Card className="h-full transition-colors hover:bg-accent/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{title}</CardTitle>
                  <span className="text-sm text-muted-foreground">
                    {count}
                  </span>
                </div>
                <CardDescription className="line-clamp-2">
                  {description}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
