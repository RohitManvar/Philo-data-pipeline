const KEY = "enlyghten_reading_list";

export interface SavedPhilosopher {
  slug: string;
  name: string;
  era: string | null;
  school: string | null;
  savedAt: string;
}

export function getSaved(): SavedPhilosopher[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function isSaved(slug: string): boolean {
  return getSaved().some((p) => p.slug === slug);
}

export function toggleSave(p: SavedPhilosopher): boolean {
  const list = getSaved();
  const exists = list.findIndex((x) => x.slug === p.slug);
  if (exists >= 0) {
    list.splice(exists, 1);
    localStorage.setItem(KEY, JSON.stringify(list));
    return false;
  } else {
    list.unshift({ ...p, savedAt: new Date().toISOString() });
    localStorage.setItem(KEY, JSON.stringify(list));
    return true;
  }
}
