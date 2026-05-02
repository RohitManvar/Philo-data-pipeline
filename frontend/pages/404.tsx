import Head from "next/head";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function NotFound() {
  return (
    <>
      <Head><title>404 &mdash; Enlyghten</title></Head>
      <div className="np-shell">
        <Navbar />
        <div className="np-headline-block" style={{ marginTop: 48, marginBottom: 48 }}>
          <div className="kicker">404 &middot; Not Found</div>
          <h1 style={{ fontSize: "clamp(48px, 10vw, 96px)" }}>Lost in Thought</h1>
          <div className="deck">
            The philosopher you seek has wandered beyond these pages — or perhaps never existed at all.
          </div>
          <div style={{ marginTop: 32, display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/" className="profile-action-btn">Return to Front Page &rarr;</Link>
            <Link href="/archive" className="profile-action-btn">Browse the Archive &rarr;</Link>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
