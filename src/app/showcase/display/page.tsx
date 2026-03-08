"use client";

import * as React from "react";
import { ComponentSection } from "../_components/component-section";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis } from "recharts";

const chartData = [
  { month: "Jan", desktop: 186, mobile: 80 },
  { month: "Feb", desktop: 305, mobile: 200 },
  { month: "Mar", desktop: 237, mobile: 120 },
  { month: "Apr", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "Jun", desktop: 214, mobile: 140 },
];

const chartConfig = {
  desktop: { label: "Desktop", color: "var(--chart-1)" },
  mobile: { label: "Mobile", color: "var(--chart-2)" },
} satisfies ChartConfig;

export default function DisplayShowcase() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Data Display</h1>
        <p className="mt-2 text-muted-foreground">6 components</p>
      </div>

      <ComponentSection
        title="Table"
        description="Data table display (Header, Body, Caption)"
      >
        <Table>
          <TableCaption>Recent stock alerts</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Stock</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Base Price</TableHead>
              <TableHead>Current</TableHead>
              <TableHead className="text-right">Change</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Samsung Electronics</TableCell>
              <TableCell>
                <Badge>Up</Badge>
              </TableCell>
              <TableCell>70,000</TableCell>
              <TableCell>77,000</TableCell>
              <TableCell className="text-right text-green-600">
                +10.0%
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">SK Hynix</TableCell>
              <TableCell>
                <Badge variant="destructive">Down</Badge>
              </TableCell>
              <TableCell>150,000</TableCell>
              <TableCell>135,000</TableCell>
              <TableCell className="text-right text-red-600">-10.0%</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">NAVER</TableCell>
              <TableCell>
                <Badge variant="secondary">Hold</Badge>
              </TableCell>
              <TableCell>200,000</TableCell>
              <TableCell>205,000</TableCell>
              <TableCell className="text-right text-green-600">
                +2.5%
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </ComponentSection>

      <ComponentSection
        title="Avatar"
        description="Profile image or fallback text display"
      >
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>AB</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>CD</AvatarFallback>
          </Avatar>
          <Avatar className="h-12 w-12">
            <AvatarFallback className="text-lg">SA</AvatarFallback>
          </Avatar>
        </div>
      </ComponentSection>

      <ComponentSection
        title="Badge"
        description="Status or category label (default, secondary, outline, destructive)"
      >
        <div className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </div>
      </ComponentSection>

      <ComponentSection
        title="Accordion"
        description="Expandable/collapsible content panel (FAQ style)"
      >
        <Accordion className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>What is Stock Alarm?</AccordionTrigger>
            <AccordionContent>
              Stock Alarm is a service that monitors stock prices and sends
              alerts when they reach your specified thresholds.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>How does the alert work?</AccordionTrigger>
            <AccordionContent>
              You set a base price and percentage thresholds (up/down). When the
              current price crosses the threshold, you receive an email
              notification.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Is it free?</AccordionTrigger>
            <AccordionContent>
              Yes, the basic plan is free. You can monitor up to 10 stocks with
              email alerts.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </ComponentSection>

      <ComponentSection
        title="Carousel"
        description="Swipeable carousel"
      >
        <div className="mx-auto w-full max-w-sm">
          <Carousel>
            <CarouselContent>
              {Array.from({ length: 5 }, (_, i) => (
                <CarouselItem key={i}>
                  <Card>
                    <CardContent className="flex aspect-square items-center justify-center p-6">
                      <span className="text-4xl font-semibold">{i + 1}</span>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </ComponentSection>

      <ComponentSection
        title="Chart"
        description="Recharts-based data chart (Bar Chart, Tooltip, Legend)"
      >
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <BarChart data={chartData}>
            <XAxis dataKey="month" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
            <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
          </BarChart>
        </ChartContainer>
      </ComponentSection>
    </div>
  );
}
