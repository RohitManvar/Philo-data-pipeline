import Head from "next/head";
import { useRouter } from "next/router";
import { useState, FormEvent } from "react";
import { register } from "../lib/auth";
import { useAuth } from "../context/AuthContext";

export default function SignUpPage() {
  const router = useRouter();
  const { signin } = useAuth();

  const [email, setEmail]       = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

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
        <a href="/" className="auth-logo">Enl<span className="y">y</span>ghten</a>

        <div className="auth-card">
          <div className="auth-kicker">Join the Readership</div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-sub">A reader&rsquo;s pass to all the philosophy that&rsquo;s fit to read.</p>

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
              <label>Username</label>
              <input
                type="text" required
                value={username} onChange={(e) => setUsername(e.target.value)}
                placeholder="aristotle42"
                minLength={3}
              />
            </div>
            <div className="auth-field">
              <label>Password</label>
              <div className="auth-pw-wrap">
                <input
                  type={showPw ? "text" : "password"} required
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                />
                <button type="button" className="auth-eye" onClick={() => setShowPw((v) => !v)} aria-label="Toggle password visibility">
                  {showPw ? "Hide" : "Show"}
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
