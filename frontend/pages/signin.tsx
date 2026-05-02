import Head from "next/head";
import { useRouter } from "next/router";
import { useState, FormEvent } from "react";
import { login } from "../lib/auth";
import { useAuth } from "../context/AuthContext";

export default function SignInPage() {
  const router = useRouter();
  const { signin } = useAuth();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(email, password);
      signin(data.access_token, data.user);
      const next = (router.query.next as string) || "/";
      router.push(next);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Sign In &mdash; Enlyghten</title>
      </Head>
      <div className="auth-page">
        <a href="/" className="auth-back">&larr; Back</a>
        <a href="/" className="auth-logo">Enl<span className="y">y</span>ghten</a>

        <div className="auth-card">
          <div className="auth-kicker">The Readership</div>
          <h1 className="auth-title">Sign In</h1>
          <p className="auth-sub">Welcome back to the broadsheet.</p>

          <form onSubmit={submit} className="auth-form">
            <div className="auth-field">
              <label htmlFor="email">Email</label>
              <input
                id="email" name="email"
                type="email" required autoFocus autoComplete="email"
                value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
              />
            </div>
            <div className="auth-field">
              <label htmlFor="password">Password</label>
              <div className="auth-pw-wrap">
                <input
                  id="password" name="password"
                  type={showPw ? "text" : "password"} required
                  autoComplete="current-password"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <button type="button" className="auth-eye" onClick={() => setShowPw((v) => !v)} aria-label="Toggle password visibility">
                  {showPw ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <div className="auth-footer">
            No account?&nbsp;
            <a href="/signup" style={{ color: "var(--accent)" }}>Create one &rarr;</a>
          </div>
        </div>
      </div>
    </>
  );
}
