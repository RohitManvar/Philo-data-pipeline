import Head from "next/head";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";

export default function SignInPage() {
  const router = useRouter();
  const next = (router.query.next as string) || "/";

  return (
    <>
      <Head><title>Sign In &mdash; Enlyghten</title></Head>
      <div className="auth-page">
        <a href="/" className="auth-back">&larr; Back</a>
        <a href="/" className="auth-logo">Enl<span className="y">y</span>ghten</a>

        <div className="auth-card">
          <div className="auth-kicker">The Readership</div>
          <h1 className="auth-title">Sign In</h1>
          <p className="auth-sub">Welcome back to the broadsheet.</p>

          <button
            className="google-btn"
            onClick={() => signIn("google", { callbackUrl: next })}
          >
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.2 33.6 29.7 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 6 1.1 8.2 3l6-6C34.4 5.1 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.8 0 20-7.8 20-21 0-1.4-.1-2.7-.5-4z" />
              <path fill="#34A853" d="M6.3 14.7l7 5.1C15 16.1 19.1 13 24 13c3.1 0 6 1.1 8.2 3l6-6C34.4 5.1 29.5 3 24 3 16.1 3 9.3 7.9 6.3 14.7z" />
              <path fill="#FBBC05" d="M24 45c5.5 0 10.4-1.9 14.2-5.1l-6.6-5.4C29.7 36.1 27 37 24 37c-5.7 0-10.5-3.7-12.2-8.9l-6.9 5.3C8.7 40.7 15.8 45 24 45z" />
              <path fill="#EA4335" d="M44.5 20H24v8.5h11.7c-.8 2.3-2.3 4.2-4.3 5.5l6.6 5.4C41.7 36.2 45 30.6 45 24c0-1.4-.1-2.7-.5-4z" />
            </svg>
            Continue with Google
          </button>
        </div>
      </div>
    </>
  );
}
