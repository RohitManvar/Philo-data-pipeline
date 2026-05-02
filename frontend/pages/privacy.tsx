import Head from "next/head";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function PrivacyPage() {
  return (
    <>
      <Head><title>Privacy Policy &mdash; Enlyghten</title></Head>
      <div className="np-shell">
        <Navbar />

        <div className="np-headline-block" style={{ marginTop: 24 }}>
          <div className="kicker">Legal</div>
          <h1>Privacy Policy</h1>
          <div className="deck">How we handle your information</div>
        </div>

        <div className="np-article-grid" style={{ marginTop: 32 }}>
          <article className="np-article-body" style={{ maxWidth: 680 }}>
            <div className="columns">
              <p><b>Last updated: May 2026</b></p>

              <p>Enlyghten (&ldquo;we&rdquo;, &ldquo;us&rdquo;) is a personal philosophy encyclopedia project. We take your privacy seriously and collect only what is necessary to provide the service.</p>

              <h3 className="np-section-h">Information We Collect</h3>
              <p><b>Account information:</b> When you sign in with Google, we receive your name, email address, and profile photo from Google. We store only your email address to identify your account.</p>
              <p><b>Reading list:</b> The philosophers you save are stored in our database linked to your email address.</p>
              <p><b>Usage data:</b> We do not run analytics or tracking scripts. No cookies are set beyond what is required for your login session.</p>

              <h3 className="np-section-h">How We Use Your Information</h3>
              <p>Your email is used solely to store and retrieve your personal reading list across devices. We do not sell, share, or use your data for advertising.</p>

              <h3 className="np-section-h">Third-Party Services</h3>
              <p><b>Google OAuth:</b> Sign-in is handled by Google. Their privacy policy applies to the authentication step.</p>
              <p><b>Vercel:</b> The frontend is hosted on Vercel, which may log request metadata (IP, user agent) for security purposes.</p>
              <p><b>Render:</b> The API and database are hosted on Render.</p>

              <h3 className="np-section-h">Data Deletion</h3>
              <p>You can sign out at any time. To delete your account and all saved data, contact us at rohitmanvar.dev@gmail.com and we will remove your data within 7 days.</p>

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
