"use client";

import { useRef, useState, useCallback } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface StockNameProps {
  /** 종목명 */
  name: string;
}

/**
 * 종목명 컴포넌트
 *
 * truncate 시에만 Tooltip을 표시합니다.
 * hover 시 scrollWidth를 체크해 실제로 잘린 경우에만 툴팁을 띄웁니다.
 *
 * @param name - 종목명
 */
export function StockName({ name }: StockNameProps) {
  const textRef = useRef<HTMLParagraphElement>(null);
  const [open, setOpen] = useState(false);

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    if (nextOpen) {
      const el = textRef.current;
      if (el && el.scrollWidth > el.clientWidth) {
        setOpen(true);
      }
    } else {
      setOpen(false);
    }
  }, []);

  return (
    <TooltipProvider>
      <Tooltip open={open} onOpenChange={handleOpenChange}>
        <TooltipTrigger
          render={
            <p ref={textRef} className="cursor-default truncate font-medium" />
          }
        >
          {name}
        </TooltipTrigger>
        <TooltipContent>
          <p>{name}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
