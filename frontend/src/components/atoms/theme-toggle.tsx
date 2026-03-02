"use client";

import { useState } from "react";
import { Button } from "@/components/atoms/button";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof document === "undefined") {
      return false;
    }
    const root = document.documentElement;
    return root.classList.contains("dark");
  });

  function toggleTheme() {
    const root = document.documentElement;
    root.classList.toggle("dark");
    setIsDark(root.classList.contains("dark"));
  }

  return (
    <Button variant="secondary" onClick={toggleTheme}>
      {isDark ? "Switch to Light" : "Switch to Dark"}
    </Button>
  );
}
