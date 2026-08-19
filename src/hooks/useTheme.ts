import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "theme";
const QUERY = "(prefers-color-scheme: dark)";

// プライベートモード等で localStorage が使えないことがある
const readStoredTheme = (): Theme | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : null;
  } catch {
    return null;
  }
};

const getSystemTheme = (): Theme =>
  window.matchMedia?.(QUERY).matches ? "dark" : "light";

const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  // スクロールバー等のネイティブUIも選択した配色に合わせる
  root.style.colorScheme = theme;
};

/**
 * 配色テーマ。初期値は明示指定 (localStorage) があればそれ、なければOSの設定。
 * ボタンで切り替えるまではOS設定の変更にも追従する。
 */
export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(
    () => readStoredTheme() ?? getSystemTheme()
  );

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (readStoredTheme() || !window.matchMedia) return;
    const mediaQuery = window.matchMedia(QUERY);
    const handleChange = () => setTheme(getSystemTheme());
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // 保存できなくても切り替え自体は行う
      }
      return next;
    });
  }, []);

  return { theme, toggleTheme };
};
