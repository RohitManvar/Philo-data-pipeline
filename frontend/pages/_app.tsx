import "../styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "../context/AuthContext";
import { getTheme, applyTheme } from "../lib/theme";

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  useEffect(() => { applyTheme(getTheme()); }, []);
  return (
    <SessionProvider session={session}>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </SessionProvider>
  );
}
