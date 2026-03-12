"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { ChevronsUpDownIcon } from "lucide-react";
import type { StockSearchResult } from "@/types/alert";

interface StockSearchComboboxProps {
  /** 선택된 종목 */
  value?: StockSearchResult | null;
  /** 종목 선택 콜백 */
  onSelect: (stock: StockSearchResult) => void;
  /** 비활성화 여부 */
  disabled?: boolean;
}

/**
 * 종목 검색 콤보박스
 *
 * 디바운스된 검색으로 KRX 종목을 검색하고 선택합니다.
 */
export function StockSearchCombobox({
  value,
  onSelect,
  disabled = false,
}: StockSearchComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StockSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!query.trim()) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/stocks/search?q=${encodeURIComponent(query.trim())}`
        );
        if (res.ok) {
          const data: StockSearchResult[] = await res.json();
          setResults(data);
        }
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            className="w-full justify-between font-normal"
            disabled={disabled}
          />
        }
      >
        {value ? `${value.name} (${value.code})` : "종목을 검색하세요"}
        <ChevronsUpDownIcon className="ml-auto opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-[var(--anchor-width)] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="종목명 또는 코드 검색..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {loading ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                검색 중...
              </div>
            ) : query.trim() && results.length === 0 ? (
              <CommandEmpty>검색 결과가 없습니다</CommandEmpty>
            ) : (
              <CommandGroup>
                {results.map((stock) => (
                  <CommandItem
                    key={stock.code}
                    value={stock.code}
                    onSelect={() => {
                      onSelect(stock);
                      setOpen(false);
                      setQuery("");
                    }}
                    data-checked={value?.code === stock.code || undefined}
                  >
                    <span>{stock.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {stock.code}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
