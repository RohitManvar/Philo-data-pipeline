import "../styles/globals.css";
import type { AppProps } from "next/app";
import Loader from "../components/Loader";
import ScrollProgress from "../components/ScrollProgress";
import CursorGlow from "../components/CursorGlow";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Loader />
      <ScrollProgress />
      <CursorGlow />
      <Component {...pageProps} />
    </>
  );
}
