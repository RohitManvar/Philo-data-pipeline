import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { fetchPhilosophers, Philosopher } from "../lib/api";
import Navbar from "../components/Navbar";
import { cleanDate } from "../lib/clean";
import { getSaved, toggleSave, SavedPhilosopher } from "../lib/readingList";
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

  const eras = ERA_ORDER.filter((e) => byEra[e]?.length).concat(
    Object.keys(byEra).filter((e) => !ERA_ORDER.includes(e) && byEra[e]?.length)
  );

  const [readingList, setReadingList] = useState<SavedPhilosopher[]>([]);
  useEffect(() => { setReadingList(getSaved()); }, []);

  const handleRemove = (slug: string) => {
    toggleSave({ slug, name: "", era: null, school: null, savedAt: "" });
    setReadingList(getSaved());
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

        {readingList.length > 0 && (
          <div className="arc-reading-list">
            <div className="arc-era-head">
              <h2>★ Your Reading List</h2>
              <span className="arc-count">{readingList.length} saved</span>
            </div>
            <ol className="arc-list">
              {readingList.map((p) => (
                <li key={p.slug} className="arc-item">
                  <Link href={`/${p.slug}`} className="arc-link">
                    <span className="arc-name">{p.name}</span>
                    <span className="arc-rule" />
                    <span className="arc-meta">
                      {p.era || ""}
                      {p.school ? ` · ${p.school}` : ""}
                    </span>
                  </Link>
                  <button className="arc-remove" onClick={() => handleRemove(p.slug)} title="Remove">✕</button>
                </li>
              ))}
            </ol>
          </div>
        )}

        <div className="arc-body">
          {eras.map((era) => {
            const philosophers = [...(byEra[era] || [])].sort((a, b) =>
              a.philosopher_name.localeCompare(b.philosopher_name)
            );
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

        <footer className="footer">
          <div className="mark">Enl<span className="y">y</span>ghten<span className="accent">.</span></div>
          <div>All the philosophy that&rsquo;s fit to read</div>
        </footer>
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
    return { props: { byEra, total: result.total } };
  } catch {
    return { props: { byEra: {}, total: 0 } };
  }
};
