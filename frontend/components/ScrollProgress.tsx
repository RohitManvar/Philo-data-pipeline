import { useEffect } from "react";

export default function ScrollProgress() {
  useEffect(() => {
    const bar = document.getElementById("scroll-progress-bar");
    const nav = document.querySelector(".nav");

    const onScroll = () => {
      const h = document.documentElement;
      const max = (h.scrollHeight - h.clientHeight) || 1;
      const p = Math.min(1, h.scrollTop / max);
      if (bar) bar.style.transform = `scaleX(${p})`;
      if (nav) nav.classList.toggle("scrolled", h.scrollTop > 12);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return <div className="scroll-progress" id="scroll-progress-bar" />;
}
