import type { NextApiRequest, NextApiResponse } from "next";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query as { slug: string };

  if (req.method === "GET") {
    const r = await fetch(`${API}/saved/${encodeURIComponent(slug)}`);
    const data = await r.json();
    return res.status(r.status).json(data);
  }

  if (req.method === "DELETE") {
    const { email } = req.body;
    const r = await fetch(`${API}/saved/${encodeURIComponent(email)}/${encodeURIComponent(slug)}`, {
      method: "DELETE",
    });
    const data = await r.json();
    return res.status(r.status).json(data);
  }

  res.status(405).json({ detail: "Method Not Allowed" });
}
