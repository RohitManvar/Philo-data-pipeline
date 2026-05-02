import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { Philosopher } from "../lib/api";
import { cleanText, cleanDate } from "../lib/clean";

const ERA_GRADIENTS: Record<string, string> = {
  ancient:       "linear-gradient(135deg, #8b6f3f, #c9a878)",
  medieval:      "linear-gradient(135deg, #6b4a8a, #a888c0)",
  renaissance:   "linear-gradient(135deg, #b8456e, #e89db5)",
  enlightenment: "linear-gradient(135deg, #3b7bd0, #8fb8e8)",
  modern:        "linear-gradient(135deg, #2f8a6b, #7fc0a8)",
  contemporary:  "linear-gradient(135deg, #3970b8, #87aedb)",
  eastern:       "linear-gradient(135deg, #8a6a1f, #d4a83c)",
};

export function eraGradient(era: string | null): string {
  if (!era) return "linear-gradient(135deg, #7a8a6a, #b0bea0)";
  const key = era.toLowerCase();
  for (const [k, v] of Object.entries(ERA_GRADIENTS)) {
    if (key.includes(k)) return v;
  }
  return "linear-gradient(135deg, #4a4a4a, #888)";
}

export function initials(name: string): string {
  return name.split(/\s+/).map((s) => s[0]).slice(0, 2).join("").toUpperCase();
}

export default function PhilosopherCard({ p, index = 0 }: { p: Philosopher; index?: number }) {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const delay = (index % 9) * 60;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setTimeout(() => e.target.classList.add("in"), delay);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.06 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [index, p.id]);

  return (
    <Link href={`/${p.slug}`} className="np-article" ref={ref}>
      <div className="kicker">{[p.era, p.school].filter(Boolean).join(" · ")}</div>
      <div className="np-portrait" style={{ background: eraGradient(p.era) }}>
        {p.image_url ? (
          <Image src={p.image_url} alt={p.philosopher_name} fill unoptimized />
        ) : (
          <div className="initials">{initials(p.philosopher_name)}</div>
        )}
      </div>
      <h4>{p.philosopher_name}</h4>
      {(p.birth || p.death) && (
        <div className="dates">
          {p.birth && `b. ${cleanDate(p.birth)}`}
          {p.birth && p.death && " · "}
          {p.death && `d. ${cleanDate(p.death)}`}
        </div>
      )}
      <p>{cleanText(p.intro)}</p>
      <div className="byline">By <strong>The Editors</strong> · 6 min read</div>
    </Link>
  );
}
