"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Mail } from "lucide-react";
import { ComponentSection } from "../../_components/component-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { cn } from "@/lib/utils";
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from "lucide-react";

export default function CoinbaseFormsShowcase() {
  const [date, setDate] = React.useState<Date>();
  const [sliderValue, setSliderValue] = React.useState([50]);

  return (
    <div className="space-y-12">
      <div>
        <p className="cb-caption text-muted-foreground">Data Input / Forms</p>
        <h1 className="cb-section mt-1">폼 & 입력</h1>
        <p className="cb-body mt-2 text-muted-foreground">14 components</p>
      </div>

      <ComponentSection
        title="Button"
        description="variant별 + Coinbase CTA 3종 (gray pill, dark pill, blue border pill)"
      >
        <div className="space-y-4">
          <div>
            <p className="cb-caption mb-2 text-muted-foreground">shadcn variants</p>
            <div className="flex flex-wrap gap-2">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
          </div>

          <div>
            <p className="cb-caption mb-2 text-muted-foreground">size별</p>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon">
                <Mail className="h-4 w-4" />
              </Button>
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading
              </Button>
            </div>
          </div>

          <div>
            <p className="cb-caption mb-2 text-muted-foreground">
              Coinbase CTA — 56px radius pill
            </p>
            <div className="flex flex-wrap items-center gap-3">
              {/* Gray pill — standard CTA */}
              <button className="cb-cta cb-btn-label">알림 등록</button>
              {/* Dark pill — primary dark CTA */}
              <button className="cb-cta-dark cb-btn-label">시작하기</button>
              {/* Blue bordered pill — secondary interactive */}
              <button className="cb-cta-blue cb-btn-label">자세히 보기</button>
              {/* Lowercase — distinctive Coinbase quirk */}
              <button className="cb-cta cb-btn-label cb-cta-lower">get started</button>
            </div>
          </div>
        </div>
      </ComponentSection>

      <ComponentSection
        title="Input"
        description="텍스트, 비밀번호, 비활성화, 에러 상태"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="cb-email" className="cb-caption">이메일</Label>
            <Input id="cb-email" type="email" placeholder="name@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cb-password" className="cb-caption">비밀번호</Label>
            <Input id="cb-password" type="password" placeholder="••••••••" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cb-disabled" className="cb-caption">비활성화</Label>
            <Input id="cb-disabled" disabled placeholder="편집 불가" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cb-error" className="cb-caption text-destructive">
              에러 상태
            </Label>
            <Input
              id="cb-error"
              placeholder="잘못된 입력"
              className="border-destructive focus-visible:ring-destructive"
            />
            <p className="cb-caption text-destructive">
              올바른 이메일 형식이 아닙니다.
            </p>
          </div>
        </div>
      </ComponentSection>

      <ComponentSection title="Label" description="폼 요소 레이블">
        <div className="flex items-center gap-3">
          <Label htmlFor="cb-label-demo" className="cb-caption">종목 코드</Label>
          <Input id="cb-label-demo" placeholder="예: 005930" className="w-40" />
        </div>
      </ComponentSection>

      <ComponentSection
        title="Textarea"
        description="기본, 비활성화"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="cb-memo" className="cb-caption">메모</Label>
            <Textarea id="cb-memo" placeholder="종목에 대한 메모를 입력하세요." rows={4} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cb-memo-disabled" className="cb-caption">메모 (비활성화)</Label>
            <Textarea id="cb-memo-disabled" disabled placeholder="편집 불가" rows={4} />
          </div>
        </div>
      </ComponentSection>

      <ComponentSection
        title="Select"
        description="드롭다운 선택"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="cb-caption">알림 임계값</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="임계값 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">±3%</SelectItem>
                <SelectItem value="5">±5%</SelectItem>
                <SelectItem value="10">±10%</SelectItem>
                <SelectItem value="15">±15%</SelectItem>
                <SelectItem value="20">±20%</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="cb-caption">정렬 기준</Label>
            <Select defaultValue="name">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">종목명</SelectItem>
                <SelectItem value="change">등락률</SelectItem>
                <SelectItem value="date">등록일</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </ComponentSection>

      <ComponentSection
        title="Checkbox"
        description="체크/미체크/비활성화"
      >
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox id="cb-terms" />
            <Label htmlFor="cb-terms" className="cb-body-sm font-normal">
              이용약관에 동의합니다
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="cb-notify" defaultChecked />
            <Label htmlFor="cb-notify" className="cb-body-sm font-normal">
              이메일 알림 수신
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="cb-marketing" disabled />
            <Label htmlFor="cb-marketing" className="cb-body-sm font-normal text-muted-foreground">
              마케팅 정보 수신 (비활성화)
            </Label>
          </div>
        </div>
      </ComponentSection>

      <ComponentSection
        title="Radio Group"
        description="단일 선택 라디오 버튼 그룹"
      >
        <RadioGroup defaultValue="email">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="email" id="cb-notify-email" />
            <Label htmlFor="cb-notify-email" className="cb-body-sm">이메일 알림</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="push" id="cb-notify-push" />
            <Label htmlFor="cb-notify-push" className="cb-body-sm">푸시 알림</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="none" id="cb-notify-none" />
            <Label htmlFor="cb-notify-none" className="cb-body-sm">알림 없음</Label>
          </div>
        </RadioGroup>
      </ComponentSection>

      <ComponentSection
        title="Switch"
        description="On/Off 토글 스위치"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between max-w-xs">
            <Label htmlFor="cb-active-alerts" className="cb-body-sm">알림 활성화</Label>
            <Switch id="cb-active-alerts" defaultChecked />
          </div>
          <div className="flex items-center justify-between max-w-xs">
            <Label htmlFor="cb-dark-mode" className="cb-body-sm">다크 모드</Label>
            <Switch id="cb-dark-mode" />
          </div>
          <div className="flex items-center justify-between max-w-xs">
            <Label htmlFor="cb-notify-switch" className="cb-body-sm text-muted-foreground">
              알림 (비활성화)
            </Label>
            <Switch id="cb-notify-switch" disabled />
          </div>
        </div>
      </ComponentSection>

      <ComponentSection
        title="Toggle"
        description="토글 버튼 — 단일 상태 전환"
      >
        <div className="flex gap-1">
          <Toggle aria-label="굵게">
            <Bold className="h-4 w-4" />
          </Toggle>
          <Toggle aria-label="기울임">
            <Italic className="h-4 w-4" />
          </Toggle>
          <Toggle aria-label="밑줄" defaultPressed>
            <Underline className="h-4 w-4" />
          </Toggle>
        </div>
      </ComponentSection>

      <ComponentSection
        title="Toggle Group"
        description="그룹 토글 — 단일/다중 선택"
      >
        <div className="space-y-4">
          <div>
            <p className="cb-caption mb-2 text-muted-foreground">정렬 (단일)</p>
            <ToggleGroup defaultValue={["center"]}>
              <ToggleGroupItem value="left" aria-label="왼쪽 정렬">
                <AlignLeft className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="center" aria-label="가운데 정렬">
                <AlignCenter className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="right" aria-label="오른쪽 정렬">
                <AlignRight className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          <div>
            <p className="cb-caption mb-2 text-muted-foreground">서식 (다중)</p>
            <ToggleGroup defaultValue={["bold"]}>
              <ToggleGroupItem value="bold" aria-label="굵게">
                <Bold className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="italic" aria-label="기울임">
                <Italic className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="underline" aria-label="밑줄">
                <Underline className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </ComponentSection>

      <ComponentSection
        title="Slider"
        description="범위 슬라이더"
      >
        <div className="space-y-4 max-w-sm">
          <Slider
            value={sliderValue}
            onValueChange={(val) =>
              setSliderValue(Array.isArray(val) ? [...val] : [val])
            }
            max={20}
            min={1}
            step={1}
            className="w-full"
          />
          <p className="cb-caption text-muted-foreground">
            알림 임계값:{" "}
            <span className="text-foreground" style={{ color: "#0052ff" }}>
              ±{sliderValue[0]}%
            </span>
          </p>
        </div>
      </ComponentSection>

      <ComponentSection title="Calendar" description="날짜 선택 달력">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-[16px] w-fit"
          style={{ border: "1px solid rgba(91,97,110,0.2)" }}
        />
      </ComponentSection>

      <ComponentSection
        title="Date Picker"
        description="날짜 선택기 — Popover + Calendar 조합"
      >
        <Popover>
          <PopoverTrigger
            render={
              <Button
                variant="outline"
                className={cn(
                  "w-64 justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              />
            }
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "yyyy년 MM월 dd일") : <span>날짜 선택</span>}
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={date} onSelect={setDate} />
          </PopoverContent>
        </Popover>
      </ComponentSection>

      <ComponentSection
        title="Input OTP"
        description="일회용 비밀번호 입력 — 6자리, 그룹 분리"
      >
        <div className="space-y-3">
          <Label className="cb-caption text-muted-foreground">
            2단계 인증 코드 입력
          </Label>
          <InputOTP maxLength={6}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
      </ComponentSection>
    </div>
  );
}
