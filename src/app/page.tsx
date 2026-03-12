import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center gap-4">
        <h1 className="text-4xl font-bold">Stock Alarm</h1>
        <p className="text-muted-foreground">Coming soon</p>
        {process.env.NODE_ENV === "development" && (
          <Link href="/showcase">
            <Button variant="outline">UI Showcase</Button>
          </Link>
        )}
      </main>
    </div>
  );
}
