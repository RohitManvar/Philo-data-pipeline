import { GetServerSideProps } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  fetchPhilosophers, searchPhilosophers, filterPhilosophers,
  fetchEras, fetchSchools, fetchDailyPhilosopher, fetchRandomPhilosopher,
  PhilosopherList, Philosopher,
} from "../lib/api";
import PhilosopherCard, { eraGradient, initials } from "../components/PhilosopherCard";
import FilterSidebar from "../components/FilterSidebar";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { cleanText, secureUrl } from "../lib/clean";

interface Props {
  result: PhilosopherList;
  eras: string[];
  schools: string[];
  query: string;
  era: string;
  school: string;
  allTotal: number;
  daily: Philosopher | null;
  allPhilosophers: Philosopher[];
}

function LeadStory({ p }: { p: Philosopher }) {
  const inits = initials(p.philosopher_name);
  return (
    <a href={`/${p.slug}`} className="np-lead">
      <div>
        <div className="kicker">&#9733; Lead Story &middot; {p.era || "Philosophy"}</div>
        <h2>{p.philosopher_name}</h2>
        <div className="deck">{cleanText(p.intro)?.split(".")[0]}.</div>
        <div className="lede">{cleanText(p.intro)}</div>
      </div>
      <div className="np-lead-portrait">
        <div className="img" style={{ background: eraGradient(p.era) }}>
          {secureUrl(p.image_url) ? (
            <img src={secureUrl(p.image_url)!} alt={p.philosopher_name} />
          ) : (
            <div className="initials">{inits}</div>
          )}
        </div>
        <div className="caption">
          {p.philosopher_name} &middot; {p.era || "Philosopher"} &middot; From the Enlyghten archive.
        </div>
      </div>
    </a>
  );
}

export default function Home({ result: initialResult, eras: initialEras, schools: initialSchools, query, era, school, allTotal: initialTotal, daily: initialDaily, allPhilosophers }: Props) {
  const router = useRouter();
  const [result, setResult] = useState(initialResult);
  const [eras, setEras] = useState(initialEras);
  const [schools, setSchools] = useState(initialSchools);
  const [allTotal, setAllTotal] = useState(initialTotal);
  const [daily, setDaily] = useState(initialDaily);

  // If SSR returned empty (Render was sleeping), retry client-side
  useEffect(() => {
    if (initialResult.total > 0) return;
    Promise.all([
      fetchPhilosophers(1),
      fetchEras(),
      fetchSchools(),
      fetchPhilosophers(1, 1),
      fetchDailyPhilosopher().catch(() => null),
    ]).then(([r, e, s, all, d]) => {
      setResult(r); setEras(e); setSchools(s); setAllTotal(all.total); setDaily(d);
    }).catch(() => { });
  }, [initialResult.total]);

  const totalPages = Math.ceil(result.total / result.limit);
  const isFiltered = !!(query || era || school);
  const lead = !isFiltered ? result.data[0] : null;
  const grid = !isFiltered ? result.data.slice(1) : result.data;
  const [surprising, setSurprising] = useState(false);

  const handleSurprise = async () => {
    setSurprising(true);
    try {
      const p = await fetchRandomPhilosopher();
      router.push(`/${p.slug}`);
    } catch { setSurprising(false); }
  };

  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".np-reveal:not(.in)");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { (e.target as HTMLElement).classList.add("in"); io.unobserve(e.target); }
      }),
      { threshold: 0.06 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [result.data]);

  return (
    <>
      <Head>
        <title>Enlyghten &mdash; The Daily Broadsheet of Ideas</title>
        <meta name="description" content="Explore the greatest philosophers in history — their lives, ideas, and lasting influence." />
      </Head>

      <div className="np-shell">
        <Navbar total={allTotal} />

        {isFiltered && (
          <div className="np-filter" style={{ marginTop: 24 }}>
            {query && <span>Search: <b>&ldquo;{query}&rdquo;</b></span>}
            {era && <span>Era: <b>{era}</b></span>}
            {school && <span>School: <b>{school}</b></span>}
            <span style={{ color: "var(--ink-soft)", fontFamily: "var(--sans)", fontSize: 11, letterSpacing: ".06em" }}>
              {result.total} result{result.total !== 1 ? "s" : ""}
            </span>
            <a href="/" className="clear">Clear &times;</a>
          </div>
        )}

        {daily && !isFiltered && (() => {
          const ideas = daily.main_ideas ? daily.main_ideas.split(/[,·;]/).map(s => s.trim()).filter(Boolean) : [];
          return ideas.length > 0 ? (
            <div className="np-epigraph">
              <span className="np-epigraph-quote">&ldquo;{ideas[0]}&rdquo;</span>
              <span className="np-epigraph-attr">&mdash; {daily.philosopher_name}</span>
            </div>
          ) : null;
        })()}

        {daily && !isFiltered && (
          <a href={`/${daily.slug}`} className="np-daily">
            <span className="np-daily-label">&#9788; Philosopher of the Day</span>
            <span className="np-daily-name">{daily.philosopher_name}</span>
            <span className="np-daily-era">{daily.era || "Philosophy"}</span>
          </a>
        )}

        <div className="np-body">
          <main>
            {lead && <LeadStory p={lead} />}

            <div className="np-section-head">
              <h3>
                {era ? `From the ${era} Desk`
                  : school ? school
                    : isFiltered ? "Search Results"
                      : "From the Newsroom"}
              </h3>
              <span className="rule" />
              <span className="meta">{result.total} entries</span>
              {!isFiltered && (
                <button className="np-surprise" onClick={handleSurprise} disabled={surprising}>
                  {surprising ? "…" : "⚄ Surprise Me"}
                </button>
              )}
            </div>

            {grid.length === 0 && !lead ? (
              <div className="np-empty">
                <h3>No entries found.</h3>
                <p>Try another section or search term, or <a href="/" style={{ color: "var(--accent)" }}>return to the front page</a>.</p>
              </div>
            ) : (
              <div className="np-grid">
                {grid.map((p, i) => <PhilosopherCard key={p.id} p={p} index={i} />)}
              </div>
            )}

            {totalPages > 1 && (
              <div className="np-pager">
                {result.page > 1 ? (
                  <button onClick={() => { location.href = buildUrl(result.page - 1, query, era, school); }}>
                    &larr; Previous Page
                  </button>
                ) : <span />}
                <span className="num">&mdash; {result.page} / {totalPages} &mdash;</span>
                {result.page < totalPages ? (
                  <button onClick={() => { location.href = buildUrl(result.page + 1, query, era, school); }}>
                    Next Page &rarr;
                  </button>
                ) : <span />}
              </div>
            )}
          </main>

          <FilterSidebar eras={eras} schools={schools} activeEra={era} activeSchool={school} total={allTotal} allPhilosophers={allPhilosophers} />
        </div>

        <Footer />
      </div>
    </>
  );
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
  const page = Number(q.page) || 1;
  const search = (q.q as string) || "";
  const era = (q.era as string) || "";
  const school = (q.school as string) || "";
  try {
    const [result, eras, schools, allData, daily] = await Promise.all([
      search ? searchPhilosophers(search, page)
        : era || school ? filterPhilosophers(era || undefined, school || undefined, page)
          : fetchPhilosophers(page),
      fetchEras(), fetchSchools(), fetchPhilosophers(1, 1),
      fetchDailyPhilosopher().catch(() => null),
    ]);
    return { props: { result, eras, schools, query: search, era, school, allTotal: allData.total, daily: daily ?? null, allPhilosophers: [] } };
  } catch {
    return { props: { result: EMPTY_LIST, eras: [], schools: [], query: search, era, school, allTotal: 0, daily: null, allPhilosophers: [] } };
  }
};
