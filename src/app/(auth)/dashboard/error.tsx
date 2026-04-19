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
          일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
        </p>
        {error.digest && (
          <p className="mt-1 text-xs text-muted-foreground">
            오류 코드: {error.digest}
          </p>
        )}
        {process.env.NODE_ENV === "development" && (
          <pre className="mt-2 text-xs text-left text-destructive whitespace-pre-wrap break-all">
            {error.message}
          </pre>
        )}
      </div>
      <Button variant="outline" onClick={reset}>
        다시 시도
      </Button>
    </div>
  );
}
