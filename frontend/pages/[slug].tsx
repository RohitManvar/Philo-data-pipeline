import { GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { fetchPhilosopher, Philosopher } from "../lib/api";
import Navbar from "../components/Navbar";
import { eraGradient, initials } from "../components/PhilosopherCard";
import { cleanText, cleanDate } from "../lib/clean";

export default function PhilosopherPage({ p }: { p: Philosopher }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { (e.target as HTMLElement).classList.add("in"); io.unobserve(e.target); }
      }),
      { threshold: 0.08 }
    );
    el.querySelectorAll<HTMLElement>(".np-reveal").forEach((n) => io.observe(n));
    // immediately reveal first element
    const first = el.querySelector<HTMLElement>(".np-reveal");
    if (first) first.classList.add("in");
    return () => io.disconnect();
  }, [p.id]);

  const inits       = initials(p.philosopher_name);
  const firstName   = p.philosopher_name.split(" ")[0];
  const ideas       = p.main_ideas    ? p.main_ideas.split(/[,·;]/).map(s => s.trim()).filter(Boolean).slice(0, 6) : [];
  const influencedBy = p.influenced_by ? p.influenced_by.split(/[,·;]/).map(s => s.trim()).filter(Boolean) : [];
  const influenced   = p.influenced   ? p.influenced.split(/[,·;]/).map(s => s.trim()).filter(Boolean) : [];

  return (
    <>
      <Head>
        <title>{p.philosopher_name} &mdash; Enlyghten</title>
        <meta name="description" content={p.intro?.slice(0, 150)} />
      </Head>

      <div className="np-shell">
        <Navbar />

        <div ref={ref}>
          <Link href="/" className="np-back">&larr; Return to Front Page</Link>

          <div className="np-headline-block np-reveal">
            <div className="kicker">{[p.era, p.school].filter(Boolean).join(" · ")}</div>
            <h1>{p.philosopher_name}</h1>
            <div className="deck">{cleanText(p.intro)?.split(".")[0]}.</div>
            <div className="meta">
              {p.birth && <span>Born <b>{cleanDate(p.birth)}</b></span>}
              {p.death && <span>Died <b>{cleanDate(p.death)}</b></span>}
              {p.era   && <span>Era <b>{p.era}</b></span>}
              <span>By <b>The Editors</b></span>
            </div>
          </div>

          <div className="np-article-grid">
            <article className="np-article-body">
              <div className="lead-img" style={{ background: eraGradient(p.era) }}>
                {p.image_url ? (
                  <Image src={p.image_url} alt={p.philosopher_name} fill unoptimized />
                ) : (
                  <div className="initials">{inits}</div>
                )}
              </div>
              <div className="lead-cap">
                An imagined likeness of {p.philosopher_name}, drawn from contemporary accounts and later engravings.
              </div>

              <div className="columns">
                <p>{cleanText(p.intro)}</p>
                <p>
                  Few thinkers of the {p.era?.toLowerCase() || "modern"} period have proven so
                  durable. What began as a quarrel with the conventions of the day became, by quiet
                  accumulation, the architecture upon which later generations would build.
                </p>
                {p.school && (
                  <p>
                    Shaped by the {p.school} tradition, {firstName}&apos;s most distinctive moves
                    are unmistakably their own. To read them today is to feel the friction of an
                    honest mind at work &mdash; patient, unsparing, willing to be wrong.
                  </p>
                )}
              </div>

              {ideas.length > 0 && (
                <>
                  <blockquote className="np-pull np-reveal">
                    &ldquo;{ideas[0]}&rdquo; &mdash; a single phrase that gathers the spirit of the work.
                  </blockquote>

                  <h3 className="np-section-h">Principal Contributions</h3>
                  <ol className="np-ideas">
                    {ideas.map((idea, i) => (
                      <li key={i} className="np-reveal">
                        <span className="num">{String(i + 1).padStart(2, "0")}.</span>
                        <span className="body">
                          {idea}
                          <em>A concept central to {firstName}&apos;s thought.</em>
                        </span>
                      </li>
                    ))}
                  </ol>
                </>
              )}

              {(influencedBy.length > 0 || influenced.length > 0) && (
                <>
                  <h3 className="np-section-h">Intellectual Lineage</h3>
                  <div className="np-influence np-reveal">
                    {influencedBy.length > 0 && (
                      <div>
                        <h4>Influenced By</h4>
                        {influencedBy.map((name) => (
                          <span key={name} className="np-influence-item">&rarr; {name}</span>
                        ))}
                      </div>
                    )}
                    {influenced.length > 0 && (
                      <div>
                        <h4>Influenced</h4>
                        {influenced.map((name) => (
                          <span key={name} className="np-influence-item">&rarr; {name}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </article>

            <aside>
              {(p.birth || p.death || p.era || p.school) && (
                <div className="np-sidecard np-reveal">
                  <div className="h">At a Glance</div>
                  <dl>
                    {p.birth  && <><dt>Born</dt><dd>{cleanDate(p.birth)}</dd></>}
                    {p.death  && <><dt>Died</dt><dd>{cleanDate(p.death)}</dd></>}
                    {p.era    && <><dt>Era</dt><dd>{p.era}</dd></>}
                    {p.school && <><dt>School</dt><dd>{p.school}</dd></>}
                  </dl>
                </div>
              )}

              {ideas.length > 0 && (
                <div className="np-sidecard np-reveal">
                  <div className="h">Key Concepts</div>
                  <div className="np-tag-list">
                    {ideas.map((idea, i) => <span key={i}>{idea}</span>)}
                  </div>
                </div>
              )}

              {p.wikipedia_url && (
                <a href={p.wikipedia_url} target="_blank" rel="noopener noreferrer" className="np-wiki np-reveal">
                  Continue Reading on Wikipedia
                  <span className="s">External &middot; Open Source</span>
                </a>
              )}
            </aside>
          </div>
        </div>

        <footer className="footer">
          <div className="mark">Enl<span className="y">y</span>ghten<span className="accent">.</span></div>
          <div>All the philosophy that&rsquo;s fit to read &middot; Data sourced from Wikipedia &middot; Built with Next.js + FastAPI</div>
        </footer>
      </div>
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
