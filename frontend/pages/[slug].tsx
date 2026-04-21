import { GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { fetchPhilosopher, Philosopher } from "../lib/api";
import Navbar from "../components/Navbar";
import EraTag from "../components/EraTag";

export default function PhilosopherPage({ p }: { p: Philosopher }) {
  useEffect(() => {
    // Hero elements reveal immediately
    const t = setTimeout(() => {
      document.querySelectorAll(".detail-hero .reveal").forEach((el) => el.classList.add("in"));
    }, 40);
    // Body cards scroll-triggered
    const cards = document.querySelectorAll<HTMLElement>(".detail-grid .section-card, .detail-grid .wiki-card");
    cards.forEach((c, i) => {
      c.classList.add("reveal");
      if (i < 6) c.classList.add(`d${i + 1}`);
    });
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { (e.target as HTMLElement).classList.add("in"); io.unobserve(e.target); }
      }),
      { threshold: 0.08 }
    );
    cards.forEach((c) => io.observe(c));
    return () => { clearTimeout(t); io.disconnect(); };
  }, [p.id]);

  const initials = p.philosopher_name.split(" ").map((w) => w[0]).slice(0, 2).join("");

  return (
    <>
      <Head>
        <title>{p.philosopher_name} — Enlyghten</title>
        <meta name="description" content={p.intro?.slice(0, 150)} />
      </Head>

      <Navbar showSearch />

      {/* Detail hero */}
      <section className="detail-hero">
        <div className="detail-hero-inner">
          {/* Portrait with conic halo (CSS ::after) */}
          <div>
            <div className="portrait" style={{ background: "linear-gradient(135deg,#0f172a,#1e1b4b)" }}>
              {p.image_url ? (
                <Image src={p.image_url} alt={p.philosopher_name} fill className="object-cover object-top" unoptimized />
              ) : (
                <div className="initials">{initials}</div>
              )}
            </div>
          </div>

          <div>
            <Link href="/" className="back-link reveal">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              All Philosophers
            </Link>

            <h1 className="reveal d1">{p.philosopher_name}</h1>

            <div className="detail-pills reveal d2">
              <EraTag era={p.era} />
              {p.school && <span className="pill school">{p.school}</span>}
            </div>

            {(p.birth || p.death) && (
              <p className="detail-dates reveal d3">
                {p.birth && `b. ${p.birth}`}
                {p.birth && p.death && " · "}
                {p.death && `d. ${p.death}`}
              </p>
            )}

            {p.wikipedia_url && (
              <a href={p.wikipedia_url} target="_blank" rel="noopener noreferrer" className="wiki-btn reveal d4">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                Read on Wikipedia
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Body */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 28px 80px" }}>
        <div className="detail-grid">
          <div>
            <div className="section-card">
              <div className="section-label">Introduction</div>
              <h2>Who was {p.philosopher_name.split(" ")[0]}?</h2>
              <p>{p.intro}</p>
            </div>

            {p.main_ideas && (
              <div className="section-card">
                <div className="section-label">Main Ideas</div>
                <h2>Principal Contributions</h2>
                <ol className="idea-list">
                  {p.main_ideas.split(/[,·;]/).filter(Boolean).slice(0, 6).map((idea, i) => (
                    <li key={i}>
                      <span className="num">{String(i + 1).padStart(2, "0")}</span>
                      <span className="body">
                        {idea.trim()}
                        <em>A concept central to {p.philosopher_name.split(" ")[0]}&apos;s thought.</em>
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {(p.influenced_by || p.influenced) && (
              <div className="section-card">
                <div className="section-label">Influence</div>
                <h2>Intellectual Lineage</h2>
                <div className="influence-grid">
                  {p.influenced_by && (
                    <div className="influence-col">
                      <h3>Influenced by</h3>
                      {p.influenced_by.split(/[,·;]/).filter(Boolean).map((n) => (
                        <span key={n} className="item">→ {n.trim()}</span>
                      ))}
                    </div>
                  )}
                  {p.influenced && (
                    <div className="influence-col">
                      <h3>Influenced</h3>
                      {p.influenced.split(/[,·;]/).filter(Boolean).map((n) => (
                        <span key={n} className="item">→ {n.trim()}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <aside>
            {(p.birth || p.death || p.era || p.school) && (
              <div className="section-card facts">
                <div className="section-label">Quick Facts</div>
                <dl>
                  {p.birth  && <><dt>Born</dt><dd>{p.birth}</dd></>}
                  {p.death  && <><dt>Died</dt><dd>{p.death}</dd></>}
                  {p.era    && <><dt>Era</dt><dd>{p.era}</dd></>}
                  {p.school && <><dt>School</dt><dd>{p.school}</dd></>}
                </dl>
              </div>
            )}

            {p.main_ideas && (
              <div className="section-card">
                <div className="section-label">Key Ideas</div>
                <div className="tags">
                  {p.main_ideas.split(/[,·;]/).slice(0, 8).map((idea, i) => (
                    <span key={i} className="tag">{idea.trim()}</span>
                  ))}
                </div>
              </div>
            )}

            {p.wikipedia_url && (
              <a href={p.wikipedia_url} target="_blank" rel="noopener noreferrer" className="wiki-card">
                <div className="globe">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                </div>
                <div>
                  <p className="t">Read on Wikipedia</p>
                  <p className="s">Continue exploring {p.philosopher_name}&apos;s life and works</p>
                </div>
              </a>
            )}
          </aside>
        </div>
      </div>

      <footer className="footer">
        <span className="brand">Enlyghten.</span>
        Data sourced from Wikipedia · Built with Next.js + FastAPI
      </footer>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  try {
    const p = await fetchPhilosopher(params!.slug as string);
    return { props: { p } };
  } catch {
    return { notFound: true };
  }
};
