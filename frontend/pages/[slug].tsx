import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useSession, signIn } from "next-auth/react";
import { fetchPhilosopher, Philosopher } from "../lib/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { eraGradient, initials } from "../components/PhilosopherCard";
import { cleanText, cleanDate, secureUrl } from "../lib/clean";
import { isSaved } from "../lib/readingList";

export default function PhilosopherPage({ p }: { p: Philosopher }) {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied]     = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);

  // Reading progress bar
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const pct = el.scrollTop / (el.scrollHeight - el.clientHeight);
      setProgress(Math.min(100, Math.round(pct * 100)));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    const text = `${p.philosopher_name} — ${cleanText(p.intro)?.slice(0, 100)}…`;
    if (navigator.share) {
      await navigator.share({ title: p.philosopher_name, text, url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [p]);

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

  const { data: session } = useSession();
  const [saved, setSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [note, setNote] = useState("");
  const [noteEdit, setNoteEdit] = useState(false);
  const [noteSaving, setNoteSaving] = useState(false);

  useEffect(() => {
    if (!session?.user?.email) { setSaved(isSaved(p.slug)); return; }
    fetch(`/api/saved/${encodeURIComponent(session.user.email)}`)
      .then(r => r.json())
      .then((list: { slug: string; note: string }[]) => {
        const match = list.find(x => x.slug === p.slug);
        setSaved(!!match);
        if (match?.note) setNote(match.note);
      })
      .catch(() => setSaved(isSaved(p.slug)));
  }, [p.slug, session]);

  const handleSave = async () => {
    if (!session?.user?.email) { signIn(); return; }
    setSaveLoading(true);
    try {
      if (saved) {
        await fetch(`/api/saved/${encodeURIComponent(p.slug)}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: session.user.email }),
        });
        setSaved(false);
        setNote("");
        setNoteEdit(false);
      } else {
        await fetch("/api/saved", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_email: session.user.email,
            slug: p.slug,
            philosopher_name: p.philosopher_name,
            era: p.era,
            school: p.school,
          }),
        });
        setSaved(true);
      }
    } finally {
      setSaveLoading(false);
    }
  };

  const handleNoteSave = async () => {
    if (!session?.user?.email) return;
    setNoteSaving(true);
    await fetch(`/api/saved/${encodeURIComponent(p.slug)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: session.user.email, note }),
    }).finally(() => { setNoteSaving(false); setNoteEdit(false); });
  };

  const inits     = useMemo(() => initials(p.philosopher_name), [p.philosopher_name]);
  const firstName = useMemo(() => p.philosopher_name.split(" ")[0], [p.philosopher_name]);
  const ideas       = useMemo(() => p.main_ideas    ? p.main_ideas.split(/[,·;]/).map(s => s.trim()).filter(Boolean).slice(0, 6) : [], [p.main_ideas]);
  const influencedBy = useMemo(() => p.influenced_by ? p.influenced_by.split(/[,·;]/).map(s => s.trim()).filter(Boolean) : [], [p.influenced_by]);
  const influenced   = useMemo(() => p.influenced   ? p.influenced.split(/[,·;]/).map(s => s.trim()).filter(Boolean) : [], [p.influenced]);

  return (
    <>
      <Head>
        <title>{p.philosopher_name} &mdash; Enlyghten</title>
        <meta name="description" content={p.intro?.slice(0, 150)} />
      </Head>

      <div className="np-shell">
        {/* Reading progress bar */}
        <div className="np-progress-bar" style={{ width: `${progress}%` }} />

        <Navbar />

        <div ref={ref}>
          <div className="slug-topbar">
            <Link href="/" className="np-back">&larr; Return to Front Page</Link>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button className="slug-action-btn" onClick={() => setQuoteOpen(true)} title="Quote card">&#10075;</button>
              <button className="slug-action-btn" onClick={handleShare} title="Share">
                {copied ? "✓ Copied" : "↗ Share"}
              </button>
              <button className={"save-btn" + (saved ? " saved" : "")} onClick={handleSave} disabled={saveLoading}>
                {saveLoading ? "…" : saved ? "★ Saved" : "☆ Save"}
              </button>
            </div>
          </div>

          {saved && session?.user?.email && (
            <div className="slug-note-bar">
              {noteEdit ? (
                <>
                  <input
                    className="slug-note-input"
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") handleNoteSave(); if (e.key === "Escape") setNoteEdit(false); }}
                    placeholder="Add a personal note…"
                    autoFocus
                    maxLength={200}
                  />
                  <button className="slug-note-save" onClick={handleNoteSave} disabled={noteSaving}>
                    {noteSaving ? "…" : "Save"}
                  </button>
                  <button className="slug-note-cancel" onClick={() => setNoteEdit(false)}>Cancel</button>
                </>
              ) : (
                <button className="slug-note-trigger" onClick={() => setNoteEdit(true)}>
                  {note ? `✎ ${note}` : "✎ Add a note…"}
                </button>
              )}
            </div>
          )}

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
                {secureUrl(p.image_url) ? (
                  <img src={secureUrl(p.image_url)!} alt={p.philosopher_name} />
                ) : (
                  <div className="initials">{inits}</div>
                )}
              </div>
              <div className="lead-cap">
                An imagined likeness of {p.philosopher_name}, drawn from contemporary accounts and later engravings.
              </div>

              <div className="columns">
                <p>{cleanText(p.intro)}</p>
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

        <Footer />
      </div>

      {/* Quote card modal */}
      {quoteOpen && ideas.length > 0 && (
        <div className="quote-overlay" onClick={() => setQuoteOpen(false)}>
          <div className="quote-card" onClick={e => e.stopPropagation()}>
            <div className="quote-card-inner">
              <div className="quote-card-mark">Enl<span className="y">y</span>ghten</div>
              <blockquote className="quote-card-text">&ldquo;{ideas[0]}&rdquo;</blockquote>
              <div className="quote-card-attr">&mdash; {p.philosopher_name}</div>
              {p.era && <div className="quote-card-era">{p.era}</div>}
            </div>
            <div className="quote-card-actions">
              <button onClick={async () => {
                await navigator.clipboard.writeText(`"${ideas[0]}" — ${p.philosopher_name}\n\nenlyghten.vercel.app/${p.slug}`);
                setCopied(true); setTimeout(() => setCopied(false), 2000);
              }}>{copied ? "✓ Copied!" : "Copy Quote"}</button>
              <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`"${ideas[0]}" — ${p.philosopher_name}`)}&url=${encodeURIComponent(`https://philo-data-pipeline.vercel.app/${p.slug}`)}`}
                target="_blank" rel="noopener noreferrer">Share on X</a>
              <button onClick={() => setQuoteOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
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
