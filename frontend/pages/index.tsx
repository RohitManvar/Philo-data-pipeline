import { GetServerSideProps } from "next";
import Head from "next/head";
import { useEffect, useRef } from "react";
import {
  fetchPhilosophers, searchPhilosophers, filterPhilosophers,
  fetchEras, fetchSchools, PhilosopherList,
} from "../lib/api";
import PhilosopherCard from "../components/PhilosopherCard";
import SearchBar from "../components/SearchBar";
import FilterSidebar from "../components/FilterSidebar";
import Navbar from "../components/Navbar";
import EmptyState from "../components/EmptyState";
import FloatingParticles from "../components/FloatingParticles";
import TypewriterText from "../components/TypewriterText";

const QUOTES = [
  { text: "The unexamined life is not worth living.", author: "Socrates" },
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
  { text: "I think, therefore I am.", author: "René Descartes" },
  { text: "He who has a why to live for can bear almost any how.", author: "Friedrich Nietzsche" },
  { text: "Man is condemned to be free.", author: "Jean-Paul Sartre" },
  { text: "What is rational is actual; what is actual is rational.", author: "Hegel" },
  { text: "The mind is not a vessel to be filled, but a fire to be kindled.", author: "Plutarch" },
  { text: "Happiness is the meaning and the purpose of life, the whole aim of human existence.", author: "Aristotle" },
];

interface Props {
  result: PhilosopherList;
  eras: string[];
  schools: string[];
  query: string;
  era: string;
  school: string;
  allTotal: number;
}

export default function Home({ result, eras, schools, query, era, school, allTotal }: Props) {
  const totalPages = Math.ceil(result.total / result.limit);
  const isFiltered = !!(query || era || school);
  const heroRef = useRef<HTMLDivElement>(null);

  // Reveal cards
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".reveal:not(.in)");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { (e.target as HTMLElement).classList.add("in"); io.unobserve(e.target); }
      }),
      { threshold: 0.08 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [result.data]);

  // Hero parallax + fade on scroll
  useEffect(() => {
    if (!heroRef.current) return;
    // Kick off hero reveal
    requestAnimationFrame(() => {
      heroRef.current?.querySelectorAll(".reveal").forEach((el) => el.classList.add("in"));
    });
    const onScroll = () => {
      if (!heroRef.current) return;
      const y = window.scrollY;
      const inner = heroRef.current.querySelector<HTMLElement>(".hero-inner");
      if (inner) inner.style.transform = `translateY(${y * 0.22}px)`;
      heroRef.current.style.opacity = String(Math.max(0, 1 - y / 600));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <Head>
        <title>Enlyghten — Encyclopedia of Philosophical Thought</title>
        <meta name="description" content="Explore the greatest philosophers in history — their lives, ideas, and lasting influence." />
      </Head>

      <Navbar showSearch={isFiltered} />

      {/* Hero */}
      {!isFiltered && (
        <div className="hero" ref={heroRef}>
          <div className="hero-orb a" />
          <div className="hero-orb b" />
          <div className="hero-orb c" />
          <div className="hero-scan" />
          <FloatingParticles />

          <div className="hero-inner">
            <div className="hero-eyebrow reveal">
              Encyclopedia of Philosophical Thought
            </div>

            <h1 className="reveal d1">
              Explore the <em>Great Minds</em><br />of History
            </h1>

            <div className="hero-quote-wrap reveal d2">
              <TypewriterText quotes={QUOTES} />
            </div>

            <div className="hero-search reveal d3">
              <SearchBar />
            </div>

            <div className="hero-pills reveal d4">
              {eras.slice(0, 7).map((e) => (
                <a key={e} href={`/?era=${e}`} className="hero-pill">
                  <span className="dot" style={{ background: eraColor(e) }} />
                  {e}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filter banner */}
      {isFiltered && <div style={{ height: 60 }} />}
      {isFiltered && (
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "16px 28px 0" }}>
          <div className="filter-banner">
            {query  && <span className="filter-chip">Search: &ldquo;{query}&rdquo;</span>}
            {era    && <span className="filter-chip">Era: {era}</span>}
            {school && <span className="filter-chip">School: {school}</span>}
            <span style={{ color: "var(--ink-soft)", fontSize: 12, fontFamily: "var(--mono)" }}>
              {result.total} result{result.total !== 1 ? "s" : ""}
            </span>
            <a href="/" className="clear">Clear ×</a>
          </div>
        </div>
      )}

      <main className="shell">
        <div className="with-sidebar">
          <FilterSidebar eras={eras} schools={schools} activeEra={era} activeSchool={school} total={allTotal} />

          <div>
            {!isFiltered && (
              <div className="results-head reveal in">
                <div>
                  <h2>All Philosophers</h2>
                  <span className="sub">{allTotal} entries</span>
                </div>
              </div>
            )}

            {result.data.length === 0 ? (
              <EmptyState query={query} />
            ) : (
              <div className="grid">
                {result.data.map((p, i) => <PhilosopherCard key={p.id} p={p} index={i} />)}
              </div>
            )}

            {totalPages > 1 && (
              <div className="pager">
                {result.page > 1 && (
                  <button onClick={() => location.href = buildUrl(result.page - 1, query, era, school)}>← Prev</button>
                )}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                  <button key={pg} className={result.page === pg ? "active" : ""}
                    onClick={() => location.href = buildUrl(pg, query, era, school)}>{pg}</button>
                ))}
                {result.page < totalPages && (
                  <button onClick={() => location.href = buildUrl(result.page + 1, query, era, school)}>Next →</button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="footer">
        <span className="brand">Enlyghten.</span>
        Data sourced from Wikipedia · Built with Next.js + FastAPI
      </footer>
    </>
  );
}

const ERA_COLORS: Record<string, string> = {
  ancient: "#818cf8", medieval: "#c4b5fd", renaissance: "#f9a8d4",
  enlightenment: "#7dd3fc", modern: "#93c5fd", contemporary: "#6ee7b7",
  eastern: "#fcd34d", islamic: "#5eead4", african: "#fde047",
};
function eraColor(era: string) {
  for (const [k, v] of Object.entries(ERA_COLORS)) {
    if (era.toLowerCase().includes(k)) return v;
  }
  return "#94a3b8";
}

function buildUrl(page: number, q: string, era: string, school: string) {
  const p = new URLSearchParams();
  if (page > 1) p.set("page", String(page));
  if (q) p.set("q", q);
  if (era) p.set("era", era);
  if (school) p.set("school", school);
  const s = p.toString();
  return s ? `/?${s}` : "/";
}

const EMPTY_LIST: PhilosopherList = { total: 0, page: 1, limit: 21, data: [] };

export const getServerSideProps: GetServerSideProps = async ({ query: q }) => {
  const page   = Number(q.page) || 1;
  const search = (q.q as string)      || "";
  const era    = (q.era as string)    || "";
  const school = (q.school as string) || "";
  try {
    const [result, eras, schools, allData] = await Promise.all([
      search ? searchPhilosophers(search, page)
             : era || school ? filterPhilosophers(era || undefined, school || undefined, page)
             : fetchPhilosophers(page),
      fetchEras(), fetchSchools(), fetchPhilosophers(1, 1),
    ]);
    return { props: { result, eras, schools, query: search, era, school, allTotal: allData.total } };
  } catch {
    return { props: { result: EMPTY_LIST, eras: [], schools: [], query: search, era, school, allTotal: 0 } };
  }
};
