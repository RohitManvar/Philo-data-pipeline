import Head from "next/head";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function TermsPage() {
  return (
    <>
      <Head><title>Terms of Use &mdash; Enlyghten</title></Head>
      <div className="np-shell">
        <Navbar />

        <div className="np-headline-block" style={{ marginTop: 24 }}>
          <div className="kicker">Legal</div>
          <h1>Terms of Use</h1>
          <div className="deck">The rules of the readership</div>
        </div>

        <div className="np-article-grid" style={{ marginTop: 32 }}>
          <article className="np-article-body" style={{ maxWidth: 680 }}>
            <div className="columns">
              <p><b>Last updated: May 2026</b></p>

              <p>By using Enlyghten you agree to these terms. If you do not agree, please do not use the service.</p>

              <h3 className="np-section-h">Use of the Service</h3>
              <p>Enlyghten is a free, personal project providing a curated encyclopedia of philosophical thought. You may use it for personal, non-commercial reading and research.</p>
              <p>You may not scrape, reproduce, or redistribute the content of this site in bulk without permission.</p>

              <h3 className="np-section-h">User Accounts</h3>
              <p>Accounts are created via Google OAuth. You are responsible for maintaining the security of your Google account. We are not liable for any loss resulting from unauthorised access to your account.</p>

              <h3 className="np-section-h">Availability</h3>
              <p>Enlyghten is provided &ldquo;as is&rdquo; without any guarantees of uptime or availability. We reserve the right to modify or discontinue the service at any time.</p>

              <h3 className="np-section-h">Changes to These Terms</h3>
              <p>We may update these terms from time to time. Continued use of the service after changes constitutes acceptance of the new terms.</p>

              <h3 className="np-section-h">Contact</h3>
              <p>Questions? Email <a href="mailto:rohitmanvar.dev@gmail.com" style={{ color: "var(--accent)" }}>rohitmanvar.dev@gmail.com</a></p>
            </div>
          </article>
        </div>

        <Footer />
      </div>
    </>
  );
}
