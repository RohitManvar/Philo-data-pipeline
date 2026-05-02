import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import { initials } from "../components/PhilosopherCard";
import { SavedPhilosopher } from "../lib/readingList";
import { Philosopher } from "../lib/api";
import { cleanText, secureUrl } from "../lib/clean";
import { getTheme, toggleTheme } from "../lib/theme";
import Footer from "../components/Footer";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const user    = session?.user;
  const loading = status === "loading";
  const router  = useRouter();

  const [saved, setSaved]         = useState<SavedPhilosopher[]>([]);
  const [suggest, setSuggest]     = useState<Philosopher | null>(null);
  const [theme, setTheme]         = useState<"light"|"dark">("light");
  useEffect(() => { setTheme(getTheme()); }, []);

  useEffect(() => {
    if (!loading && !user) router.replace("/signin");
  }, [user, loading, router]);

  useEffect(() => {
    if (!session?.user?.email) return;
    fetch(`/api/saved/${encodeURIComponent(session.user.email)}`)
      .then(r => r.json())
      .then((list: SavedPhilosopher[]) => {
        setSaved(list);
        // Discover next: pick top era, fetch philosophers, suggest one not saved
        if (list.length === 0) return;
        const eraCounts: Record<string, number> = {};
        for (const p of list) { const e = p.era || "Unknown"; eraCounts[e] = (eraCounts[e] || 0) + 1; }
        const topEra = Object.entries(eraCounts).sort((a, b) => b[1] - a[1])[0][0];
        const savedSlugs = new Set(list.map(p => p.slug));
        fetch(`${API}/philosophers/filter?era=${encodeURIComponent(topEra)}&limit=50`)
          .then(r => r.json())
          .then(res => {
            const unsaved = res.data?.filter((p: Philosopher) => !savedSlugs.has(p.slug)) || [];
            if (unsaved.length > 0) setSuggest(unsaved[Math.floor(Math.random() * unsaved.length)]);
          })
          .catch(() => {});
      })
      .catch(() => {});
  }, [session]);

  if (loading || !user) return null;

  const name  = user.name  || user.email || "Reader";
  const email = user.email || "";

  const eraCounts: Record<string, number> = {};
  for (const p of saved) { const e = p.era || "Unknown"; eraCounts[e] = (eraCounts[e] || 0) + 1; }
  const eraEntries = Object.entries(eraCounts).sort((a, b) => b[1] - a[1]);
  const topEra = eraEntries[0]?.[0];

  // Reading streak: group saves by date
  const streak = saved.slice(0, 5).map(p => ({
    ...p,
    dateLabel: p.savedAt ? new Date(p.savedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "",
  }));

  return (
    <>
      <Head><title>{name} &mdash; Enlyghten</title></Head>
      <div className="np-shell">
        <Navbar />

        <div className="np-headline-block" style={{ marginTop: 24 }}>
          <div className="kicker">Reader Profile</div>
          <h1>{name}</h1>
          <div className="deck">Member of the Enlyghten Readership</div>
        </div>

        <div className="profile-body">
          {/* ── Left sidebar ── */}
          <div className="profile-main">
            <div className="profile-avatar">
              {user.image ? (
                <img src={user.image} alt={name} style={{ width: 120, height: 120, borderRadius: "50%", objectFit: "cover" }} />
              ) : (
                <div className="profile-initials">{initials(name)}</div>
              )}
            </div>

            <div className="np-sidecard" style={{ marginTop: 28 }}>
              <div className="h">Account Details</div>
              <dl>
                <dt>Name</dt><dd>{name}</dd>
                <dt>Email</dt><dd style={{ wordBreak: "break-all" }}>{email}</dd>
                <dt>Provider</dt><dd>Google</dd>
              </dl>
            </div>

            <div className="np-sidecard" style={{ marginTop: 16 }}>
              <div className="h">Reading Stats</div>
              <dl>
                <dt>Saved</dt><dd>{saved.length} philosopher{saved.length !== 1 ? "s" : ""}</dd>
                {topEra && <><dt>Top Era</dt><dd>{topEra}</dd></>}
                <dt>Archive</dt><dd>{saved.length} of 288</dd>
              </dl>
            </div>

            <Link href="/archive" className="profile-action-btn" style={{ marginTop: 16 }}>Browse Archive &rarr;</Link>
            <button className="profile-action-btn profile-theme-btn" style={{ marginTop: 8 }} onClick={() => {
              const next = toggleTheme(); setTheme(next);
            }}>
              {theme === "dark" ? "☀ Light Mode" : "☽ Dark Mode"}
            </button>
            <button className="profile-signout" onClick={() => signOut({ callbackUrl: "/" })}>Sign Out</button>
          </div>

          {/* ── Right content ── */}
          <div className="profile-aside">

            {/* Reading Streak */}
            {streak.length > 0 && (
              <div className="np-sidecard" style={{ marginBottom: 24 }}>
                <div className="h">Reading Streak</div>
                <p style={{ fontFamily: "var(--sans)", fontSize: 11, color: "var(--ink-soft)", letterSpacing: "0.06em", margin: "0 0 12px" }}>
                  {saved.length} philosopher{saved.length !== 1 ? "s" : ""} saved &mdash; keep it up
                </p>
                <ol className="profile-saved-list">
                  {streak.map((p, i) => (
                    <li key={p.slug} className="profile-streak-item">
                      <span className="profile-streak-num">{String(i + 1).padStart(2, "0")}</span>
                      <Link href={`/${p.slug}`} className="profile-streak-link">
                        <span className="profile-saved-name">{p.name}</span>
                        <span className="profile-saved-era">{p.era || "—"}</span>
                      </Link>
                      {p.dateLabel && <span className="profile-streak-date">{p.dateLabel}</span>}
                    </li>
                  ))}
                </ol>
                {saved.length > 5 && (
                  <Link href="/archive" className="profile-see-more">+{saved.length - 5} more in archive</Link>
                )}
              </div>
            )}

            {/* Discover Next */}
            {suggest ? (
              <div className="np-sidecard profile-discover">
                <div className="h">Discover Next</div>
                <p style={{ fontFamily: "var(--sans)", fontSize: 11, color: "var(--ink-soft)", letterSpacing: "0.06em", margin: "0 0 16px" }}>
                  Based on your interest in <b>{topEra}</b> philosophy
                </p>
                <Link href={`/${suggest.slug}`} className="profile-discover-card">
                  {secureUrl(suggest.image_url) && (
                    <img src={secureUrl(suggest.image_url)!} alt={suggest.philosopher_name} className="profile-discover-img" />
                  )}
                  <div>
                    <div className="profile-discover-name">{suggest.philosopher_name}</div>
                    <div className="profile-discover-era">{[suggest.era, suggest.school].filter(Boolean).join(" · ")}</div>
                    <div className="profile-discover-intro">{cleanText(suggest.intro)?.slice(0, 100)}…</div>
                  </div>
                </Link>
              </div>
            ) : saved.length === 0 ? (
              <div className="np-sidecard">
                <div className="h">Your Reading List</div>
                <p style={{ fontFamily: "var(--serif)", fontSize: 15, lineHeight: 1.6, margin: 0, color: "var(--ink-soft)" }}>
                  No philosophers saved yet. Click &ldquo;Save to Archive&rdquo; on any philosopher page to build your list.
                </p>
                <Link href="/" style={{ display: "inline-block", marginTop: 14, fontFamily: "var(--sans)", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--accent)" }}>
                  Start Reading &rarr;
                </Link>
              </div>
            ) : null}

          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
