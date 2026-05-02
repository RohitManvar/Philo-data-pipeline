const KEY = "enlyghten_theme";

export function getTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return (localStorage.getItem(KEY) as "light" | "dark") || "light";
}

export function applyTheme(theme: "light" | "dark") {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(KEY, theme);
}

export function toggleTheme(): "light" | "dark" {
  const next = getTheme() === "dark" ? "light" : "dark";
  applyTheme(next);
  return next;
}
