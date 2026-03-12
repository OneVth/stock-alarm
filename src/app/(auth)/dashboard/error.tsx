"use client";

import { Button } from "@/components/ui/button";
import { AlertCircleIcon } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <AlertCircleIcon className="size-10 text-destructive" />
      <div className="text-center">
        <h2 className="text-lg font-semibold">오류가 발생했습니다</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {error.message || "대시보드를 불러오는 중 문제가 발생했습니다."}
        </p>
      </div>
      <Button variant="outline" onClick={reset}>
        다시 시도
      </Button>
    </div>
  );
}
