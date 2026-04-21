import { useEffect, useState } from "react";

interface Quote { text: string; author: string; }

export default function TypewriterText({ quotes }: { quotes: Quote[] }) {
  const [qi, setQi] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [phase, setPhase] = useState<"typing" | "pause" | "erasing">("typing");

  useEffect(() => {
    const q = quotes[qi].text;
    let timeout: ReturnType<typeof setTimeout>;

    if (phase === "typing") {
      if (displayed.length < q.length) {
        timeout = setTimeout(() => setDisplayed(q.slice(0, displayed.length + 1)), 38);
      } else {
        timeout = setTimeout(() => setPhase("pause"), 2800);
      }
    } else if (phase === "pause") {
      timeout = setTimeout(() => setPhase("erasing"), 400);
    } else {
      if (displayed.length > 0) {
        timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 18);
      } else {
        setQi((qi + 1) % quotes.length);
        setPhase("typing");
      }
    }

    return () => clearTimeout(timeout);
  }, [displayed, phase, qi, quotes]);

  return (
    <div className="hero-quote">
      <span>&ldquo;{displayed}<span className="cursor" /></span>
      {phase !== "erasing" && displayed === quotes[qi].text && (
        <span className="who">— {quotes[qi].author}</span>
      )}
    </div>
  );
}
