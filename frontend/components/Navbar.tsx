import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { initials } from "./PhilosopherCard";

const ERAS = ["Ancient", "Medieval", "Renaissance", "Enlightenment", "Modern", "Contemporary", "Eastern"];

export default function Navbar({ total }: { total?: number }) {
  const router    = useRouter();
  const { user }  = useAuth();
  const activeEra = (router.query.era as string) || "";
  const currentQ  = (router.query.q  as string) || "";

  const [q, setQ]         = useState(currentQ);
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    setDateStr(new Date().toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    }));
  }, []);

  useEffect(() => { setQ(currentQ); }, [currentQ]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(q.trim() ? `/?q=${encodeURIComponent(q.trim())}` : "/");
  };

  return (
    <header>
      <div className="np-topbar">
        <div className="left">
          <span>{dateStr || "—"}</span>
          <span>Edition · Web</span>
        </div>
        <div className="right">
          <Link href="/archive" style={{ color: router.pathname === "/archive" ? "var(--ink)" : "inherit" }}>Archive</Link>
          <Link href="/about" style={{ color: router.pathname === "/about" ? "var(--ink)" : "inherit" }}>About</Link>
          {user ? (
            <Link href="/profile" className="nav-avatar" title={user.username}>
              {initials(user.username)}
            </Link>
          ) : (
            <Link href="/signin" style={{ color: router.pathname === "/signin" ? "var(--ink)" : "inherit" }}>Sign In</Link>
          )}
        </div>
      </div>

      <div className="np-masthead" onClick={() => router.push("/")}>
        <div className="established">Established MMXXIV · A Daily Encyclopedia of Thought</div>
        <h1>Enl<span className="y">y</span>ghten</h1>
        <div className="tagline">&ldquo;All the philosophy that&rsquo;s fit to read&rdquo;</div>
        <div className="np-byline">&ldquo;I&rsquo;m exerting myself to escape the same mind that traps me&rdquo; &mdash; rohyt</div>
      </div>

      <div className="np-masthead-meta">
        <span>Vol. MMXXVI &middot; No. CCCXIV</span>
        <span className="center">The Daily Broadsheet of Ideas</span>
        <span>{total !== undefined ? `${total} Entries` : "Price · One Thought"}</span>
      </div>

      <div className="np-sections">
        <Link href="/" className={"item" + (!activeEra ? " active" : "")}>All</Link>
        {ERAS.map((era) => (
          <Link key={era} href={`/?era=${era}`} className={"item" + (activeEra === era ? " active" : "")}>
            {era}
          </Link>
        ))}
      </div>

      <div className="np-search-row">
        <span>Search</span>
        <form onSubmit={submit}>
          <input
            type="text"
            placeholder="A name, an idea, a school of thought…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </form>
        {total !== undefined && (
          <span style={{ fontStyle: "italic", textTransform: "none", letterSpacing: 0, fontFamily: "var(--serif)" }}>
            {total} entries
          </span>
        )}
      </div>
    </header>
  );
}
