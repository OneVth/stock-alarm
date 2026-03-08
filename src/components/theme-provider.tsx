"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

const THEME_COLORS = [
  { name: "zinc", label: "Zinc", color: "#18181b" },
  { name: "slate", label: "Slate", color: "#1e293b" },
  { name: "rose", label: "Rose", color: "#e11d48" },
  { name: "blue", label: "Blue", color: "#2563eb" },
  { name: "green", label: "Green", color: "#16a34a" },
  { name: "orange", label: "Orange", color: "#ea580c" },
  { name: "violet", label: "Violet", color: "#7c3aed" },
  { name: "red", label: "Red", color: "#dc2626" },
] as const;

type ThemeColor = (typeof THEME_COLORS)[number]["name"];

type ThemeColorContextType = {
  themeColor: ThemeColor;
  setThemeColor: (color: ThemeColor) => void;
  colors: typeof THEME_COLORS;
};

const ThemeColorContext = React.createContext<ThemeColorContextType | undefined>(
  undefined
);

export function useThemeColor() {
  const context = React.useContext(ThemeColorContext);
  if (!context) {
    throw new Error("useThemeColor must be used within a ThemeProvider");
  }
  return context;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeColor, setThemeColorState] = React.useState<ThemeColor>("zinc");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme-color") as ThemeColor | null;
    if (stored && THEME_COLORS.some((c) => c.name === stored)) {
      setThemeColorState(stored);
      document.documentElement.setAttribute("data-theme", stored);
    }
  }, []);

  const setThemeColor = React.useCallback((color: ThemeColor) => {
    setThemeColorState(color);
    localStorage.setItem("theme-color", color);
    if (color === "zinc") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", color);
    }
  }, []);

  // Apply theme on mount
  React.useEffect(() => {
    if (mounted && themeColor !== "zinc") {
      document.documentElement.setAttribute("data-theme", themeColor);
    }
  }, [mounted, themeColor]);

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="theme-mode"
    >
      <ThemeColorContext.Provider
        value={{ themeColor, setThemeColor, colors: THEME_COLORS }}
      >
        {children}
      </ThemeColorContext.Provider>
    </NextThemesProvider>
  );
}
