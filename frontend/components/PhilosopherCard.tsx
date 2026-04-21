import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { Philosopher } from "../lib/api";
import EraTag from "./EraTag";

export default function PhilosopherCard({ p, index = 0 }: { p: Philosopher; index?: number }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const initials = p.philosopher_name
    .split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  // Scroll-triggered entrance
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const delay = (index % 6) * 60;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add("in"), delay);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    io.observe(el);
    return () => io.disconnect();
  }, [index, p.id]);

  // Magnetic cursor glow
  const onMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const r = ref.current!.getBoundingClientRect();
    ref.current!.style.setProperty("--mx", (e.clientX - r.left) + "px");
    ref.current!.style.setProperty("--my", (e.clientY - r.top) + "px");
  };

  return (
    <Link href={`/${p.slug}`} className="card" ref={ref} onMouseMove={onMouseMove}>
      <div className="card-img">
        {p.image_url ? (
          <div className="bg w-full h-full relative">
            <Image src={p.image_url} alt={p.philosopher_name} fill className="object-cover object-top" unoptimized />
          </div>
        ) : (
          <div className="initials">{initials}</div>
        )}
        <EraTag era={p.era} />
        <div className="shine" />
      </div>

      <div className="card-body">
        <h3 className="card-name">{p.philosopher_name}</h3>
        {(p.birth || p.school) && (
          <p className="card-years">
            {[p.birth && `b. ${p.birth}`, p.school].filter(Boolean).join(" · ")}
          </p>
        )}
        <p className="card-intro">{p.intro}</p>
        <span className="read-more">Read more <span className="arrow">→</span></span>
      </div>
    </Link>
  );
}
