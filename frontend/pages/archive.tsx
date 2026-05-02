import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/router";
import { fetchPhilosophers, Philosopher } from "../lib/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { cleanDate } from "../lib/clean";
import { SavedPhilosopher } from "../lib/readingList";
import { useSession } from "next-auth/react";

interface Props {
  byEra: Record<string, Philosopher[]>;
  total: number;
}

const ERA_ORDER = ["Ancient", "Medieval", "Renaissance", "Enlightenment", "Modern", "Contemporary", "Eastern"];

export default function ArchivePage({ byEra, total }: Props) {
  const { data: session, status } = useSession();
  const user = session?.user;
  const loading = status === "loading";
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/signin?next=/archive");
  }, [user, loading, router]);

  const eras = useMemo(() =>
    ERA_ORDER.filter((e) => byEra[e]?.length).concat(
      Object.keys(byEra).filter((e) => !ERA_ORDER.includes(e) && byEra[e]?.length)
    ), [byEra]);

  const [readingList, setReadingList] = useState<SavedPhilosopher[]>([]);
  const [listLoading, setListLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.email) { setListLoading(false); return; }
    fetch(`/api/saved/${encodeURIComponent(session.user.email)}`)
      .then(r => r.json())
      .then(data => { setReadingList(data); setListLoading(false); })
      .catch(() => setListLoading(false));
  }, [session]);

  const handleRemove = async (slug: string) => {
    if (!session?.user?.email) return;
    await fetch(`/api/saved/${encodeURIComponent(slug)}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: session.user.email }),
    });
    setReadingList(prev => prev.filter(p => p.slug !== slug));
  };

  if (loading || !user) return null;

  return (
    <>
      <Head>
        <title>Archive &mdash; Enlyghten</title>
        <meta name="description" content="Browse all philosophers in the Enlyghten archive, organised by era." />
      </Head>

      <div className="np-shell">
        <Navbar total={total} />

        <div className="np-headline-block" style={{ marginTop: 24 }}>
          <div className="kicker">Complete Index</div>
          <h1>The Archive</h1>
          <div className="deck">Every thinker in the record, ordered by era and alphabetically within.</div>
          <div className="meta">
            <span><b>{total}</b> Philosophers</span>
            <span><b>{eras.length}</b> Eras</span>
          </div>
        </div>

        {listLoading ? (
          <div className="arc-reading-list">
            <div className="arc-era-head">
              <h2>★ Your Reading List</h2>
            </div>
            <ol className="arc-list">
              {[1, 2, 3].map(i => (
                <li key={i} className="arc-item arc-skeleton">
                  <span className="arc-skeleton-name" />
                  <span className="arc-skeleton-meta" />
                </li>
              ))}
            </ol>
          </div>
        ) : readingList.length === 0 ? (
          <div className="arc-reading-list arc-empty">
            <div className="arc-empty-icon">☆</div>
            <div className="arc-empty-title">Your reading list is empty</div>
            <div className="arc-empty-desc">
              Visit any philosopher&rsquo;s page and click <b>☆ Save</b> to build your personal archive.
            </div>
            <Link href="/" className="profile-action-btn" style={{ marginTop: 16, display: "inline-block" }}>
              Start Reading &rarr;
            </Link>
          </div>
        ) : (
          <div className="arc-reading-list">
            <div className="arc-era-head">
              <h2>★ Your Reading List</h2>
              <span className="arc-count">{readingList.length} saved</span>
            </div>
            <ol className="arc-list">
              {readingList.map((p) => (
                <li key={p.slug} className="arc-item arc-item-with-note">
                  <Link href={`/${p.slug}`} className="arc-link">
                    <span className="arc-name">{p.name}</span>
                    <span className="arc-rule" />
                    <span className="arc-meta">
                      {p.era || ""}
                      {p.school ? ` · ${p.school}` : ""}
                    </span>
                  </Link>
                  {p.note && <span className="arc-note">{p.note}</span>}
                  <button className="arc-remove" onClick={() => handleRemove(p.slug)} title="Remove">✕</button>
                </li>
              ))}
            </ol>
          </div>
        )}

        <div className="arc-body">
          {eras.map((era) => {
            const philosophers = byEra[era];
            return (
              <section key={era} className="arc-era">
                <div className="arc-era-head">
                  <h2>{era}</h2>
                  <span className="arc-count">{philosophers.length} entries</span>
                </div>
                <ol className="arc-list">
                  {philosophers.map((p) => (
                    <li key={p.id} className="arc-item">
                      <Link href={`/${p.slug}`} className="arc-link">
                        <span className="arc-name">{p.philosopher_name}</span>
                        <span className="arc-rule" />
                        <span className="arc-meta">
                          {p.birth ? cleanDate(p.birth) : ""}
                          {p.birth && p.death ? " – " : ""}
                          {p.death ? cleanDate(p.death) : ""}
                          {p.school ? ` · ${p.school}` : ""}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </section>
            );
          })}
        </div>

        <Footer />
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const result = await fetchPhilosophers(1, 500);
    const byEra: Record<string, Philosopher[]> = {};
    for (const p of result.data) {
      const key = p.era || "Unknown";
      if (!byEra[key]) byEra[key] = [];
      byEra[key].push(p);
    }
    for (const key of Object.keys(byEra)) {
      byEra[key].sort((a, b) => a.philosopher_name.localeCompare(b.philosopher_name));
    }
    return { props: { byEra, total: result.total } };
  } catch {
    return { props: { byEra: {}, total: 0 } };
  }
};
