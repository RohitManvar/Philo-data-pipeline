import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { initials } from "./PhilosopherCard";

const ERAS = ["Ancient", "Medieval", "Renaissance", "Enlightenment", "Modern", "Contemporary", "Eastern"];

export default function Navbar({ total }: { total?: number }) {
  const router    = useRouter();
  const activeEra = (router.query.era as string) || "";
  const currentQ  = (router.query.q  as string) || "";
  const { data: session } = useSession();
  const user = session?.user;
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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
          {!user && <Link href="/about" className="np-signin-link">About</Link>}
          {user ? (
            <div className="np-user-chip" ref={dropRef} onClick={() => setDropOpen((v) => !v)}>
              <span className="np-user-avatar">{initials(user.name || user.email || "U")}</span>
              <span>{user.name?.split(" ")[0] || user.email}</span>
              <span className="np-user-caret">▾</span>
              {dropOpen && (
                <div className="np-user-dropdown">
                  <Link href="/profile" className="np-dd-item" onClick={() => setDropOpen(false)}>Profile</Link>
                  <Link href="/archive" className="np-dd-item" onClick={() => setDropOpen(false)}>Archive</Link>
                  <Link href="/about" className="np-dd-item" onClick={() => setDropOpen(false)}>About</Link>
                  <button className="np-dd-item np-dd-signout" onClick={() => { signOut({ callbackUrl: "/" }); setDropOpen(false); }}>Sign Out</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/archive" className="np-signin-link">Archive</Link>
              <Link href="/signin" className="np-signin-link">Sign In</Link>
            </>
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
            id="search" name="q"
            type="text" autoComplete="off"
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
