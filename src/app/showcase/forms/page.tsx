"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Mail } from "lucide-react";
import type { JSONContent } from "@tiptap/react";
import { ComponentSection } from "../_components/component-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TiptapEditor, TiptapViewer } from "@/components/editor";
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
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";

const sampleContent: JSONContent = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [
        { type: "text", marks: [{ type: "bold" }], text: "반도체 업황 회복 기대" },
      ],
    },
    {
      type: "bulletList",
      content: [
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", text: "삼성전자 HBM3E 양산 본격화" },
              ],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", text: "SK하이닉스 " },
                {
                  type: "text",
                  marks: [{ type: "italic" }],
                  text: "실적 서프라이즈",
                },
                { type: "text", text: " 전망" },
              ],
            },
          ],
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        { type: "text", text: "참고: " },
        {
          type: "text",
          marks: [
            {
              type: "link",
              attrs: { href: "https://example.com", target: "_blank" },
            },
          ],
          text: "관련 기사 링크",
        },
      ],
    },
  ],
};

export default function FormsShowcase() {
  const [date, setDate] = React.useState<Date>();
  const [sliderValue, setSliderValue] = React.useState([50]);
  const [editorContent, setEditorContent] = React.useState<JSONContent | undefined>();
  const [editableContent, setEditableContent] = React.useState<JSONContent>(sampleContent);
  const [savedContent, setSavedContent] = React.useState<JSONContent>(sampleContent);
  const [isEditing, setIsEditing] = React.useState(false);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Data Input / Forms</h1>
        <p className="mt-2 text-muted-foreground">15 components</p>
      </div>

      <ComponentSection
        title="Button"
        description="Various variants (default, secondary, destructive, outline, ghost, link) and sizes (sm, default, lg, icon)"
      >
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon">
              <Mail className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button disabled>Disabled</Button>
            <Button disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading
            </Button>
          </div>
        </div>
      </ComponentSection>

      <ComponentSection
        title="Input"
        description="Text input field (email, password, file, etc.)"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="Email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="Password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="file">File</Label>
            <Input id="file" type="file" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="disabled">Disabled</Label>
            <Input id="disabled" disabled placeholder="Disabled" />
          </div>
        </div>
      </ComponentSection>

      <ComponentSection title="Label" description="Form element label">
        <div className="flex items-center gap-2">
          <Label htmlFor="label-demo">Username</Label>
          <Input id="label-demo" placeholder="Enter username" />
        </div>
      </ComponentSection>

      <ComponentSection
        title="Textarea"
        description="Multi-line text input field"
      >
        <div className="space-y-2">
          <Label htmlFor="textarea-demo">Message</Label>
          <Textarea
            id="textarea-demo"
            placeholder="Type your message here."
          />
          <p className="text-xs text-muted-foreground">
            Your message will be sent to the support team.
          </p>
        </div>
      </ComponentSection>

      <ComponentSection
        title="Select"
        description="Dropdown selection component"
      >
        <div className="w-64">
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select a fruit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
              <SelectItem value="blueberry">Blueberry</SelectItem>
              <SelectItem value="grape">Grape</SelectItem>
              <SelectItem value="pineapple">Pineapple</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </ComponentSection>

      <ComponentSection
        title="Checkbox"
        description="Checkbox input (multiple selection)"
      >
        <div className="space-y-3">
          {["Accept terms and conditions", "Push notifications", "Marketing emails"].map(
            (label) => (
              <div key={label} className="flex items-center space-x-2">
                <Checkbox id={label} />
                <Label htmlFor={label} className="text-sm font-normal">
                  {label}
                </Label>
              </div>
            )
          )}
        </div>
      </ComponentSection>

      <ComponentSection
        title="Radio Group"
        description="Single selection radio button group"
      >
        <RadioGroup defaultValue="comfortable">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="default" id="r1" />
            <Label htmlFor="r1">Default</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="comfortable" id="r2" />
            <Label htmlFor="r2">Comfortable</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="compact" id="r3" />
            <Label htmlFor="r3">Compact</Label>
          </div>
        </RadioGroup>
      </ComponentSection>

      <ComponentSection title="Switch" description="On/Off toggle switch">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch id="airplane-mode" />
            <Label htmlFor="airplane-mode">Airplane Mode</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="notifications" defaultChecked />
            <Label htmlFor="notifications">Notifications</Label>
          </div>
        </div>
      </ComponentSection>

      <ComponentSection
        title="Toggle"
        description="Toggle button (Bold, Italic, Underline, etc.)"
      >
        <div className="flex gap-1">
          <Toggle aria-label="Toggle bold">
            <Bold className="h-4 w-4" />
          </Toggle>
          <Toggle aria-label="Toggle italic">
            <Italic className="h-4 w-4" />
          </Toggle>
          <Toggle aria-label="Toggle underline">
            <Underline className="h-4 w-4" />
          </Toggle>
        </div>
      </ComponentSection>

      <ComponentSection
        title="Toggle Group"
        description="Toggle button group (single/multiple selection)"
      >
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm text-muted-foreground">
              Single selection
            </p>
            <ToggleGroup defaultValue={["center"]}>
              <ToggleGroupItem value="left" aria-label="Align left">
                <AlignLeft className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="center" aria-label="Align center">
                <AlignCenter className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="right" aria-label="Align right">
                <AlignRight className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          <div>
            <p className="mb-2 text-sm text-muted-foreground">
              Multiple selection
            </p>
            <ToggleGroup defaultValue={[]}>
              <ToggleGroupItem value="bold" aria-label="Toggle bold">
                <Bold className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="italic" aria-label="Toggle italic">
                <Italic className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem
                value="underline"
                aria-label="Toggle underline"
              >
                <Underline className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </ComponentSection>

      <ComponentSection
        title="Slider"
        description="Range value slider"
      >
        <div className="space-y-4">
          <Slider
            value={sliderValue}
            onValueChange={(val) => setSliderValue(Array.isArray(val) ? [...val] : [val])}
            max={100}
            step={1}
            className="w-full"
          />
          <p className="text-sm text-muted-foreground">
            Value: {sliderValue[0]}
          </p>
        </div>
      </ComponentSection>

      <ComponentSection title="Calendar" description="Date selection calendar">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border w-fit"
        />
      </ComponentSection>

      <ComponentSection
        title="Date Picker"
        description="Date selection component (Popover + Calendar)"
      >
        <Popover>
          <PopoverTrigger
            render={
              <Button
                variant="outline"
                className={cn(
                  "w-[280px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              />
            }
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={date} onSelect={setDate} />
          </PopoverContent>
        </Popover>
      </ComponentSection>

      <ComponentSection
        title="Input OTP"
        description="One-time password input (6-digit, grouped)"
      >
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
      </ComponentSection>

      <ComponentSection
        title="Tiptap Editor"
        description="Rich text editor (Bold, Italic, List, Link) with JSON content"
      >
        <div className="space-y-6">
          {/* 기본 에디터 */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">기본 에디터 (빈 상태)</p>
            <TiptapEditor
              onChange={(content) => setEditorContent(content)}
            />
            {editorContent && (
              <pre className="mt-2 max-h-40 overflow-auto rounded-md bg-muted p-3 text-xs">
                {JSON.stringify(editorContent, null, 2)}
              </pre>
            )}
          </div>

          {/* 내용 있는 에디터 */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">내용 있는 에디터</p>
            <TiptapEditor content={sampleContent} />
          </div>

          {/* 읽기 전용 뷰어 */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">읽기 전용 뷰어</p>
            <div className="rounded-lg border p-3">
              <TiptapViewer content={sampleContent} />
            </div>
          </div>

          {/* 편집 모드 전환 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">편집 모드 전환</p>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSavedContent(editableContent);
                        setIsEditing(false);
                      }}
                    >
                      저장
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditableContent(savedContent);
                        setIsEditing(false);
                      }}
                    >
                      취소
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                  >
                    수정
                  </Button>
                )}
              </div>
            </div>
            {isEditing ? (
              <TiptapEditor
                content={editableContent}
                onChange={(content) => setEditableContent(content)}
              />
            ) : (
              <div className="rounded-lg border p-3">
                <TiptapViewer content={savedContent} />
              </div>
            )}
          </div>
        </div>
      </ComponentSection>
    </div>
  );
}
