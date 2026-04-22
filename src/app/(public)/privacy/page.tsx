import type { Metadata } from "next"
import Link from "next/link"
import { PrivacySummary } from "@/components/legal/privacy-summary"
import PrivacyPolicy from "@/content/legal/privacy-policy.mdx"

export const metadata: Metadata = {
  title: "개인정보 처리방침 | Stock Alarm",
  description: "Stock Alarm 개인정보 처리방침",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b px-4 py-4">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Stock Alarm
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12">
        <PrivacySummary />

        <article className="prose prose-neutral dark:prose-invert max-w-none">
          <PrivacyPolicy />
        </article>
      </main>

      <footer className="border-t px-4 py-6 text-center text-sm text-muted-foreground">
        © 2026 Stock Alarm
      </footer>
    </div>
  )
}
