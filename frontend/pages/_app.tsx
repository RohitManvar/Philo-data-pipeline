import "../styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect, useState } from "react";
import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "../context/AuthContext";
import { getTheme, applyTheme } from "../lib/theme";

function QuoteSplash() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Only show once per session
    if (sessionStorage.getItem("splash_shown")) { setVisible(false); return; }
    sessionStorage.setItem("splash_shown", "1");
    const fadeTimer = setTimeout(() => setFading(true), 3000);
    const hideTimer = setTimeout(() => setVisible(false), 4200);
    return () => { clearTimeout(fadeTimer); clearTimeout(hideTimer); };
  }, []);

  if (!visible) return null;

  return (
    <div className={"quote-splash" + (fading ? " quote-splash-fade" : "")}>
      <div className="quote-splash-inner">
        <div className="quote-splash-mark">Enl<span className="y">y</span>ghten</div>
        <blockquote className="quote-splash-text">
          &ldquo;I&rsquo;m exerting myself to escape the same mind that traps me.&rdquo;
        </blockquote>
        <div className="quote-splash-attr">&mdash; rohyt</div>
      </div>
    </div>
  );
}

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  useEffect(() => { applyTheme(getTheme()); }, []);
  return (
    <SessionProvider session={session}>
      <AuthProvider>
        <QuoteSplash />
        <Component {...pageProps} />
      </AuthProvider>
    </SessionProvider>
  );
}
