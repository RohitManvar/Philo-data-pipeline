import { GetServerSideProps } from "next";
import Head from "next/head";
import { useEffect } from "react";
import {
  fetchPhilosophers, searchPhilosophers, filterPhilosophers,
  fetchEras, fetchSchools, PhilosopherList, Philosopher,
} from "../lib/api";
import PhilosopherCard, { eraGradient, initials } from "../components/PhilosopherCard";
import FilterSidebar from "../components/FilterSidebar";
import Navbar from "../components/Navbar";
import { cleanText, cleanDate } from "../lib/clean";

interface Props {
  result: PhilosopherList;
  eras: string[];
  schools: string[];
  query: string;
  era: string;
  school: string;
  allTotal: number;
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
          <div className="initials">{inits}</div>
        </div>
        <div className="caption">
          {p.philosopher_name} &middot; {p.era || "Philosopher"} &middot; From the Enlyghten archive.
        </div>
      </div>
    </a>
  );
}

export default function Home({ result, eras, schools, query, era, school, allTotal }: Props) {
  const totalPages = Math.ceil(result.total / result.limit);
  const isFiltered = !!(query || era || school);
  const lead       = !isFiltered ? result.data[0] : null;
  const grid       = !isFiltered ? result.data.slice(1) : result.data;

  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".np-reveal:not(.in)");
    const io  = new IntersectionObserver(
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
            {query  && <span>Search: <b>&ldquo;{query}&rdquo;</b></span>}
            {era    && <span>Era: <b>{era}</b></span>}
            {school && <span>School: <b>{school}</b></span>}
            <span style={{ color: "var(--ink-soft)", fontFamily: "var(--sans)", fontSize: 11, letterSpacing: ".06em" }}>
              {result.total} result{result.total !== 1 ? "s" : ""}
            </span>
            <a href="/" className="clear">Clear &times;</a>
          </div>
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

          <FilterSidebar eras={eras} schools={schools} activeEra={era} activeSchool={school} total={allTotal} />
        </div>

        <footer className="footer">
          <div className="mark">Enl<span className="y">y</span>ghten<span className="accent">.</span></div>
          <div>All the philosophy that&rsquo;s fit to read &middot; Data sourced from Wikipedia &middot; Built with Next.js + FastAPI</div>
        </footer>
      </div>
    </>
  );
}

function buildUrl(page: number, q: string, era: string, school: string) {
  const p = new URLSearchParams();
  if (page > 1) p.set("page", String(page));
  if (q)      p.set("q", q);
  if (era)    p.set("era", era);
  if (school) p.set("school", school);
  const s = p.toString();
  return s ? `/?${s}` : "/";
}

const EMPTY_LIST: PhilosopherList = { total: 0, page: 1, limit: 21, data: [] };

export const getServerSideProps: GetServerSideProps = async ({ query: q }) => {
  const page   = Number(q.page) || 1;
  const search = (q.q      as string) || "";
  const era    = (q.era    as string) || "";
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
