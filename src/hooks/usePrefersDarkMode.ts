import { useSyncExternalStore } from "react";

const QUERY = "(prefers-color-scheme: dark)";

const subscribe = (onStoreChange: () => void) => {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const mediaQuery = window.matchMedia(QUERY);
  mediaQuery.addEventListener("change", onStoreChange);
  return () => mediaQuery.removeEventListener("change", onStoreChange);
};

// matchMedia が使えない環境ではライトモードを既定とする
const getSnapshot = () => {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia(QUERY).matches;
};

/**
 * OSの配色設定 (prefers-color-scheme) がダークかどうかを返す。
 * 設定変更にも追従する。
 */
export const usePrefersDarkMode = () =>
  useSyncExternalStore(subscribe, getSnapshot, () => false);
