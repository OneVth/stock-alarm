"use client"

import * as React from "react"
import { type LucideIcon } from "lucide-react"

type Label = {
  icon: LucideIcon
  title: string
  summary: string
  detail: string[]
}

type Layout = "grid" | "list"
type Density = "compact" | "comfortable"
type IconSet = "lucide" | "none"

/**
 * 개인정보 처리방침 요약 카드 컴포넌트
 */
type Props = {
  /** 표시할 항목 레이블 목록 */
  labels: Label[]
  /** 카드 레이아웃 */
  layout?: Layout
  /** 카드 밀도 */
  density?: Density
  /** 아이콘 표시 여부 */
  iconSet?: IconSet
  className?: string
}

export function LabelingCard({
  labels,
  layout = "grid",
  density = "comfortable",
  iconSet = "none",
  className,
}: Props) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null)
  const showIcons = iconSet !== "none"

  const containerClass =
    layout === "grid"
      ? "grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3 rounded-lg overflow-hidden border"
      : "flex flex-col divide-y border rounded-lg overflow-hidden"

  const cellPad = density === "compact" ? "p-4" : "p-5"

  return (
    <div className={`${containerClass} ${className ?? ""}`}>
      {labels.map((label, i) => {
        const Icon = label.icon
        const isOpen = openIndex === i
        return (
          <button
            type="button"
            key={label.title}
            onClick={() => setOpenIndex(isOpen ? null : i)}
            className={`bg-background text-left transition-colors hover:bg-muted/40 ${cellPad}`}
          >
            <div className="flex items-center gap-2">
              {showIcons && <Icon className="h-4 w-4 text-muted-foreground" />}
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {label.title}
              </span>
            </div>
            <p className="mt-2 text-sm text-foreground">{label.summary}</p>
            {isOpen && (
              <ul className="mt-3 space-y-1 border-t pt-3 text-xs text-muted-foreground">
                {label.detail.map((d, j) => (
                  <li key={j}>{d}</li>
                ))}
              </ul>
            )}
          </button>
        )
      })}
    </div>
  )
}
