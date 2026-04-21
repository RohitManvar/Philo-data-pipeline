const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Philosopher {
  id: number;
  philosopher_name: string;
  slug: string;
  intro: string;
  birth: string | null;
  death: string | null;
  era: string | null;
  school: string | null;
  main_ideas: string | null;
  influenced: string | null;
  influenced_by: string | null;
  image_url: string | null;
  wikipedia_url: string | null;
  scraped_at: string | null;
}

export interface PhilosopherList {
  total: number;
  page: number;
  limit: number;
  data: Philosopher[];
}

export async function fetchPhilosophers(page = 1, limit = 21): Promise<PhilosopherList> {
  const res = await fetch(`${API_BASE}/philosophers?page=${page}&limit=${limit}`);
  if (!res.ok) throw new Error("Failed to fetch philosophers");
  return res.json();
}

export async function fetchPhilosopher(slug: string): Promise<Philosopher> {
  const res = await fetch(`${API_BASE}/philosophers/${slug}`);
  if (!res.ok) throw new Error("Philosopher not found");
  return res.json();
}

export async function searchPhilosophers(q: string, page = 1): Promise<PhilosopherList> {
  const res = await fetch(`${API_BASE}/philosophers/search?q=${encodeURIComponent(q)}&page=${page}`);
  if (!res.ok) throw new Error("Search failed");
  return res.json();
}

export async function filterPhilosophers(era?: string, school?: string, page = 1): Promise<PhilosopherList> {
  const params = new URLSearchParams({ page: String(page) });
  if (era) params.append("era", era);
  if (school) params.append("school", school);
  const res = await fetch(`${API_BASE}/philosophers/filter?${params}`);
  if (!res.ok) throw new Error("Filter failed");
  return res.json();
}

export async function fetchEras(): Promise<string[]> {
  const res = await fetch(`${API_BASE}/categories/eras`);
  if (!res.ok) throw new Error("Failed to fetch eras");
  return res.json();
}

export async function fetchSchools(): Promise<string[]> {
  const res = await fetch(`${API_BASE}/categories/schools`);
  if (!res.ok) throw new Error("Failed to fetch schools");
  return res.json();
}
