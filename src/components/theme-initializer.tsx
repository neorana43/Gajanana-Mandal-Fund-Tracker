"use client";

import { useEffect } from "react";

export default function ThemeInitializer() {
  useEffect(() => {
    // Always enforce light theme
    document.documentElement.classList.remove("dark");
  }, []);

  return null;
}
