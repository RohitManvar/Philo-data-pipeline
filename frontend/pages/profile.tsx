import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { initials } from "../components/PhilosopherCard";

export default function ProfilePage() {
  const { user, loading, signout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/signin");
  }, [user, loading, router]);

  if (loading || !user) return null;

  const joined = new Date(user.created_at).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  const handleSignOut = () => {
    signout();
    router.push("/");
  };

  return (
    <>
      <Head>
        <title>{user.username} &mdash; Enlyghten</title>
      </Head>
      <div className="np-shell">
        <Navbar />

        <div className="np-headline-block" style={{ marginTop: 24 }}>
          <div className="kicker">Reader Profile</div>
          <h1>{user.username}</h1>
          <div className="deck">Member of the Enlyghten Readership</div>
          <div className="meta">
            <span>Joined <b>{joined}</b></span>
            <span>Edition <b>Web</b></span>
          </div>
        </div>

        <div className="profile-body">
          <div className="profile-main">
            <div className="profile-avatar">
              <div className="profile-initials">{initials(user.username)}</div>
            </div>

            <div className="np-sidecard" style={{ marginTop: 28 }}>
              <div className="h">Account Details</div>
              <dl>
                <dt>Username</dt>
                <dd>{user.username}</dd>
                <dt>Email</dt>
                <dd>{user.email}</dd>
                <dt>Member since</dt>
                <dd>{joined}</dd>
              </dl>
            </div>

            <button className="profile-signout" onClick={handleSignOut}>
              Sign Out
            </button>
          </div>

          <div className="profile-aside">
            <div className="np-sidecard">
              <div className="h">Your Desk</div>
              <p style={{ fontFamily: "var(--serif)", fontSize: 15, lineHeight: 1.6, margin: 0 }}>
                Bookmarks, reading history, and personal notes are coming soon.
                For now, your account is your pass to the full Enlyghten archive.
              </p>
            </div>
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
