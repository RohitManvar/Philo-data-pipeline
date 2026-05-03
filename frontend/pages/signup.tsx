import Head from "next/head";
import { useRouter } from "next/router";
import { useState, FormEvent } from "react";
import { register } from "../lib/auth";
import { useAuth } from "../context/AuthContext";

export default function SignUpPage() {
  const router = useRouter();
  const { signin } = useAuth();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await register(email, username, password);
      signin(data.access_token, data.user);
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Sign Up &mdash; Enlyghten</title>
      </Head>
      <div className="auth-page">
        <a href="/" className="auth-back">&larr; Back</a>
        <a href="/" className="auth-logo">Enl<span className="y">y</span>ghten</a>

        <div className="auth-card">
          <div className="auth-kicker">Join the Readership</div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-sub">A reader&rsquo;s pass to all the philosophy that&rsquo;s fit to read.</p>

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
              <label htmlFor="username">Username</label>
              <input
                id="username" name="username"
                type="text" required autoComplete="username"
                value={username} onChange={(e) => setUsername(e.target.value)}
                placeholder="aristotle42"
                minLength={3}
              />
            </div>
            <div className="auth-field">
              <label htmlFor="password">Password</label>
              <div className="auth-pw-wrap">
                <input
                  id="password" name="password"
                  type={showPw ? "text" : "password"} required
                  autoComplete="new-password"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                />
                <button type="button" className="auth-eye" onClick={() => setShowPw((v) => !v)} aria-label="Toggle password visibility">
                  {showPw ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <div className="auth-footer">
            Already have an account?&nbsp;
            <a href="/signin" style={{ color: "var(--accent)" }}>Sign in &rarr;</a>
          </div>
        </div>
      </div>
    </>
  );
}
