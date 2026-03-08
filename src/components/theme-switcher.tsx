"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useThemeColor } from "@/components/theme-provider";

const modes = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const { themeColor, setThemeColor, colors } = useThemeColor();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" disabled>
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" size="icon" />}>
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="end">
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Mode</p>
            <div className="flex gap-1">
              {modes.map(({ value, label, icon: Icon }) => (
                <Button
                  key={value}
                  variant={theme === value ? "default" : "outline"}
                  size="sm"
                  className="flex-1 gap-1.5"
                  onClick={() => setTheme(value)}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Color</p>
            <div className="grid grid-cols-4 gap-2">
              {colors.map(({ name, label, color }) => (
                <button
                  key={name}
                  className={cn(
                    "group flex flex-col items-center gap-1 rounded-md p-1.5 transition-colors hover:bg-accent",
                    themeColor === name && "bg-accent"
                  )}
                  onClick={() => setThemeColor(name)}
                >
                  <span
                    className={cn(
                      "h-6 w-6 rounded-full border-2 transition-transform",
                      themeColor === name
                        ? "border-foreground scale-110"
                        : "border-transparent group-hover:border-muted-foreground/50"
                    )}
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-[10px] text-muted-foreground">
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
