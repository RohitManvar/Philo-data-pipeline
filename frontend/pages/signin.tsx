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
      router.push("/");
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
        <a href="/" className="auth-logo">Enl<span className="y">y</span>ghten</a>

        <div className="auth-card">
          <div className="auth-kicker">The Readership</div>
          <h1 className="auth-title">Sign In</h1>
          <p className="auth-sub">Welcome back to the broadsheet.</p>

          <form onSubmit={submit} className="auth-form">
            <div className="auth-field">
              <label>Email</label>
              <input
                type="email" required autoFocus
                value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
              />
            </div>
            <div className="auth-field">
              <label>Password</label>
              <div className="auth-pw-wrap">
                <input
                  type={showPw ? "text" : "password"} required
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <button type="button" className="auth-eye" onClick={() => setShowPw((v) => !v)} aria-label="Toggle password visibility">
                  {showPw ? "Hide" : "Show"}
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
