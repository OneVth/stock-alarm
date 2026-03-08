"use client";

import * as React from "react";
import { ChevronsUpDown } from "lucide-react";
import { ComponentSection } from "../_components/component-section";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

export default function LayoutShowcase() {
  const [collapsibleOpen, setCollapsibleOpen] = React.useState(false);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Layout & Structure</h1>
        <p className="mt-2 text-muted-foreground">6 components</p>
      </div>

      <ComponentSection title="Card" description="Content grouping container">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Card Title</CardTitle>
              <CardDescription>Card description text</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Card content area</p>
            </CardContent>
            <CardFooter>
              <Button size="sm">Action</Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Notification</CardTitle>
              <CardDescription>You have 3 unread messages.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {["Push Notifications", "Email Alerts", "SMS"].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 rounded-md border p-3"
                  >
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Variants: Header, Title, Description, Content, Footer
        </p>
      </ComponentSection>

      <ComponentSection
        title="Separator"
        description="Visual divider for content (horizontal/vertical)"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium">Horizontal</p>
            <Separator className="my-2" />
            <p className="text-sm text-muted-foreground">
              Content below separator
            </p>
          </div>
          <div className="flex h-5 items-center gap-4">
            <span className="text-sm">Home</span>
            <Separator orientation="vertical" />
            <span className="text-sm">Dashboard</span>
            <Separator orientation="vertical" />
            <span className="text-sm">Settings</span>
          </div>
        </div>
      </ComponentSection>

      <ComponentSection
        title="Aspect Ratio"
        description="Fixed aspect ratio container (16:9, 4:3, 1:1)"
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="mb-2 text-xs text-muted-foreground">16:9</p>
            <div className="aspect-video rounded-md bg-muted flex items-center justify-center">
              <span className="text-sm text-muted-foreground">16:9</span>
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs text-muted-foreground">4:3</p>
            <div className="aspect-[4/3] rounded-md bg-muted flex items-center justify-center">
              <span className="text-sm text-muted-foreground">4:3</span>
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs text-muted-foreground">1:1</p>
            <div className="aspect-square rounded-md bg-muted flex items-center justify-center">
              <span className="text-sm text-muted-foreground">1:1</span>
            </div>
          </div>
        </div>
      </ComponentSection>

      <ComponentSection
        title="Scroll Area"
        description="Custom scrollbar scrollable region"
      >
        <ScrollArea className="h-48 w-full rounded-md border p-4">
          {Array.from({ length: 20 }, (_, i) => (
            <div key={i} className="py-2 text-sm">
              Item {i + 1} - Scrollable content example
            </div>
          ))}
        </ScrollArea>
      </ComponentSection>

      <ComponentSection
        title="Resizable"
        description="Drag-resizable panel group (horizontal/vertical)"
      >
        <ResizablePanelGroup
          orientation="horizontal"
          className="min-h-[200px] rounded-lg border"
        >
          <ResizablePanel defaultSize={50}>
            <div className="flex h-full items-center justify-center p-6">
              <span className="font-semibold">Panel A</span>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={50}>
            <ResizablePanelGroup orientation="vertical">
              <ResizablePanel defaultSize={50}>
                <div className="flex h-full items-center justify-center p-6">
                  <span className="font-semibold">Panel B</span>
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={50}>
                <div className="flex h-full items-center justify-center p-6">
                  <span className="font-semibold">Panel C</span>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ComponentSection>

      <ComponentSection
        title="Collapsible"
        description="Expandable/collapsible content area"
      >
        <Collapsible
          open={collapsibleOpen}
          onOpenChange={setCollapsibleOpen}
          className="w-full space-y-2"
        >
          <div className="flex items-center justify-between rounded-md border px-4 py-2">
            <span className="text-sm font-semibold">
              3 items starred
            </span>
            <CollapsibleTrigger render={<Button variant="ghost" size="sm" />}>
              <ChevronsUpDown className="h-4 w-4" />
              <span className="sr-only">Toggle</span>
            </CollapsibleTrigger>
          </div>
          <div className="rounded-md border px-4 py-2 text-sm">
            Always visible item
          </div>
          <CollapsibleContent className="space-y-2">
            <div className="rounded-md border px-4 py-2 text-sm">
              Hidden item 1
            </div>
            <div className="rounded-md border px-4 py-2 text-sm">
              Hidden item 2
            </div>
          </CollapsibleContent>
        </Collapsible>
      </ComponentSection>
    </div>
  );
}
