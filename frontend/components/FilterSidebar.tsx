import { useRouter } from "next/router";
import { useState } from "react";
import Link from "next/link";
import { isCleanSchool } from "../lib/clean";
import { Philosopher, fetchPhilosophers } from "../lib/api";

interface Props {
  eras: string[];
  schools: string[];
  activeEra?: string;
  activeSchool?: string;
  total: number;
  allPhilosophers?: Philosopher[];
}

const QUOTES = [
  { text: "The unexamined life is not worth living.", who: "Socrates" },
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", who: "Aristotle" },
  { text: "I think, therefore I am.", who: "Descartes" },
];

type Panel = "thinkers" | "eras" | "schools" | null;

export default function FilterSidebar({ eras, schools, activeEra, activeSchool, total }: Props) {
  const router  = useRouter();
  const isAll   = !activeEra && !activeSchool;
  const quote   = QUOTES[Math.floor(Date.now() / 86400000) % QUOTES.length];
  const [open, setOpen] = useState<Panel>(null);
  const [thinkers, setThinkers] = useState<Philosopher[]>([]);
  const [thinkersLoading, setThinkersLoading] = useState(false);

  const toggle = (panel: Panel) => {
    const next = open === panel ? null : panel;
    setOpen(next);
    if (next === "thinkers" && thinkers.length === 0) {
      setThinkersLoading(true);
      fetchPhilosophers(1, 500)
        .then(res => setThinkers(res.data.slice().sort((a, b) => a.philosopher_name.localeCompare(b.philosopher_name))))
        .catch(() => {})
        .finally(() => setThinkersLoading(false));
    }
  };

  const apply = (era?: string, school?: string) => {
    const q: Record<string, string> = {};
    if (era) q.era = era;
    if (school) q.school = school;
    router.push({ pathname: "/", query: q });
  };

  return (
    <aside className="np-aside">
      <div className="np-aside-block">
        <div className="head">By the Numbers</div>
        <div className="np-stats">
          <button className={"np-stat-btn" + (open === "thinkers" ? " active" : "")} onClick={() => toggle("thinkers")}>
            <div className="n">{total}</div>
            <div className="l">Thinkers</div>
          </button>
          <button className={"np-stat-btn" + (open === "eras" ? " active" : "")} onClick={() => toggle("eras")}>
            <div className="n">{eras.length}</div>
            <div className="l">Eras</div>
          </button>
          <button className={"np-stat-btn" + (open === "schools" ? " active" : "")} onClick={() => toggle("schools")}>
            <div className="n">{schools.length}</div>
            <div className="l">Schools</div>
          </button>
          <div>
            <div className="n">∞</div>
            <div className="l">Questions</div>
          </div>
        </div>

        {open === "thinkers" && (
          <div className="np-stat-panel">
            <div className="np-stat-panel-head">All Thinkers</div>
            {thinkersLoading ? (
              <div style={{ padding: "12px 0", fontFamily: "var(--sans)", fontSize: 11, color: "var(--ink-soft)", letterSpacing: "0.1em" }}>Loading…</div>
            ) : (
              <ul className="np-stat-list">
                {thinkers.map(p => (
                  <li key={p.slug}>
                    <Link href={`/${p.slug}`} className="np-stat-list-link">
                      <span>{p.philosopher_name}</span>
                      {p.era && <span className="np-stat-list-meta">{p.era}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {open === "eras" && (
          <div className="np-stat-panel">
            <div className="np-stat-panel-head">All Eras</div>
            <ul className="np-stat-list">
              {eras.map(era => (
                <li key={era}>
                  <button className="np-stat-list-link" onClick={() => { apply(era); setOpen(null); }}>
                    <span>{era}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {open === "schools" && (
          <div className="np-stat-panel">
            <div className="np-stat-panel-head">All Schools</div>
            <ul className="np-stat-list">
              {schools.filter(isCleanSchool).map(school => (
                <li key={school}>
                  <button className="np-stat-list-link" onClick={() => { apply(undefined, school); setOpen(null); }}>
                    <span>{school}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="np-aside-block">
        <div className="head">Sections of the Paper</div>
        <ul className="np-era-list">
          <li className={isAll ? "active" : ""} onClick={() => router.push("/")}>
            <span>All Departments</span>
            <span className="num">{total}</span>
          </li>
          {eras.map((era) => (
            <li key={era} className={activeEra === era ? "active" : ""} onClick={() => apply(era)}>
              <span>{era}</span>
            </li>
          ))}
        </ul>
      </div>

      {schools.length > 0 && (
        <div className="np-aside-block">
          <div className="head">Schools of Thought</div>
          <ul className="np-era-list">
            {schools.filter(isCleanSchool).slice(0, 12).map((school) => (
              <li
                key={school}
                className={activeSchool === school ? "active" : ""}
                onClick={() => apply(undefined, school)}
                style={{ fontSize: 13.5 }}
              >
                <span>{school}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="np-aside-block">
        <div className="head">Quotation of the Day</div>
        <div className="np-quote">
          {quote.text}
          <span className="who">&mdash; {quote.who}</span>
        </div>
      </div>
    </aside>
  );
}
