import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function Footer() {
  const [showTop, setShowTop] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setShowTop(entry.isIntersecting),
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <footer className="footer" ref={ref}>
      <div className="mark">Enl<span className="y">y</span>ghten<span className="accent">.</span></div>
      <div>All the philosophy that&rsquo;s fit to read</div>

      <div className="footer-links">
        <Link href="/about">About Enlyghten</Link>
        <span className="footer-sep">&middot;</span>
        <Link href="/privacy">Privacy Policy</Link>
        <span className="footer-sep">&middot;</span>
        <Link href="/terms">Terms of Use</Link>
      </div>

      <div className="footer-meta">Last updated &middot; May 2026</div>

      {showTop && (
        <button
          className="footer-top-btn"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          ↑ Back to Top
        </button>
      )}
    </footer>
  );
}
