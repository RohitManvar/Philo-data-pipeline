import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import { initials } from "../components/PhilosopherCard";
import { SavedPhilosopher } from "../lib/readingList";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const loading = status === "loading";
  const router = useRouter();

  const [saved, setSaved] = useState<SavedPhilosopher[]>([]);
  useEffect(() => {
    if (!session?.user?.email) return;
    fetch(`/api/saved/${encodeURIComponent(session.user.email)}`)
      .then(r => r.json())
      .then(setSaved)
      .catch(() => {});
  }, [session]);

  useEffect(() => {
    if (!loading && !user) router.replace("/signin");
  }, [user, loading, router]);

  if (loading || !user) return null;

  const name  = user.name  || user.email || "Reader";
  const email = user.email || "";

  // Era breakdown
  const eraCounts: Record<string, number> = {};
  for (const p of saved) {
    const era = p.era || "Unknown";
    eraCounts[era] = (eraCounts[era] || 0) + 1;
  }
  const eraEntries = Object.entries(eraCounts).sort((a, b) => b[1] - a[1]);

  return (
    <>
      <Head>
        <title>{name} &mdash; Enlyghten</title>
      </Head>
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
                <dt>Email</dt><dd>{email}</dd>
                <dt>Provider</dt><dd>Google</dd>
              </dl>
            </div>

            <div className="np-sidecard" style={{ marginTop: 16 }}>
              <div className="h">Reading Stats</div>
              <dl>
                <dt>Saved</dt><dd>{saved.length} philosopher{saved.length !== 1 ? "s" : ""}</dd>
                {eraEntries.length > 0 && (
                  <>
                    <dt>Top Era</dt><dd>{eraEntries[0][0]}</dd>
                  </>
                )}
              </dl>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
              <Link href="/archive" className="profile-action-btn">Browse Archive &rarr;</Link>
            </div>

            <button className="profile-signout" onClick={() => signOut({ callbackUrl: "/" })}>
              Sign Out
            </button>
          </div>

          {/* ── Right content ── */}
          <div className="profile-aside">
            {eraEntries.length > 0 && (
              <div className="np-sidecard" style={{ marginBottom: 24 }}>
                <div className="h">Reading by Era</div>
                <div className="profile-era-bars">
                  {eraEntries.map(([era, count]) => (
                    <div key={era} className="profile-era-row">
                      <span className="profile-era-label">{era}</span>
                      <div className="profile-era-track">
                        <div className="profile-era-fill" style={{ width: `${(count / saved.length) * 100}%` }} />
                      </div>
                      <span className="profile-era-count">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {saved.length > 0 ? (
              <div className="np-sidecard">
                <div className="h" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Saved Philosophers</span>
                  <Link href="/archive" style={{ fontFamily: "var(--sans)", fontSize: 11, letterSpacing: "0.1em", color: "var(--ink-soft)" }}>View all &rarr;</Link>
                </div>
                <ol className="profile-saved-list">
                  {saved.slice(0, 8).map((p) => (
                    <li key={p.slug}>
                      <Link href={`/${p.slug}`} className="profile-saved-item">
                        <span className="profile-saved-name">{p.name}</span>
                        <span className="profile-saved-era">{p.era || "—"}</span>
                      </Link>
                    </li>
                  ))}
                </ol>
                {saved.length > 8 && (
                  <Link href="/archive" className="profile-see-more">+{saved.length - 8} more in archive</Link>
                )}
              </div>
            ) : (
              <div className="np-sidecard">
                <div className="h">Your Reading List</div>
                <p style={{ fontFamily: "var(--serif)", fontSize: 15, lineHeight: 1.6, margin: 0, color: "var(--ink-soft)" }}>
                  No philosophers saved yet. Click &ldquo;Save to Archive&rdquo; on any philosopher page to build your list.
                </p>
                <Link href="/" style={{ display: "inline-block", marginTop: 14, fontFamily: "var(--sans)", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--accent)" }}>
                  Start Reading &rarr;
                </Link>
              </div>
            )}

            <div className="np-quote" style={{ marginTop: 22 }}>
              &ldquo;I&rsquo;m exerting myself to escape the same mind that traps me.&rdquo;
              <span className="who">&mdash; rohyt</span>
            </div>
          </div>
        </div>

        <footer className="footer">
          <div className="mark">Enl<span className="y">y</span>ghten<span className="accent">.</span></div>
          <div>All the philosophy that&rsquo;s fit to read</div>
        </footer>
      </div>
    </>
  );
}
