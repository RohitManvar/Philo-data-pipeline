import type { NextApiRequest, NextApiResponse } from "next";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const q = (req.query.q as string) || "";
  if (!q || q.length < 2) return res.json([]);
  try {
    const r = await fetch(`${API}/philosophers/search?q=${encodeURIComponent(q)}&limit=6`);
    const data = await r.json();
    const items = (data.data || []).map((p: any) => ({
      slug: p.slug,
      philosopher_name: p.philosopher_name,
      era: p.era,
    }));
    res.json(items);
  } catch {
    res.json([]);
  }
}
