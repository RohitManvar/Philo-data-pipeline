import { useRouter } from "next/router";
import { isCleanSchool } from "../lib/clean";

interface Props {
  eras: string[];
  schools: string[];
  activeEra?: string;
  activeSchool?: string;
  total: number;
}

const QUOTES = [
  { text: "The unexamined life is not worth living.", who: "Socrates" },
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", who: "Aristotle" },
  { text: "I think, therefore I am.", who: "Descartes" },
];

export default function FilterSidebar({ eras, schools, activeEra, activeSchool, total }: Props) {
  const router  = useRouter();
  const isAll   = !activeEra && !activeSchool;
  const quote   = QUOTES[Math.floor(Date.now() / 86400000) % QUOTES.length];

  const apply = (era?: string, school?: string) => {
    const q: Record<string, string> = {};
    if (era) q.era = era;
    if (school) q.school = school;
    router.push({ pathname: "/", query: q });
  };

  return (
    <aside className="np-aside">
      <div className="np-aside-block">
        <div className="head">By the Numbers</div>
        <div className="np-stats">
          <div>
            <div className="n">{total}</div>
            <div className="l">Thinkers</div>
          </div>
          <div>
            <div className="n">{eras.length}</div>
            <div className="l">Eras</div>
          </div>
          <div>
            <div className="n">{schools.length}</div>
            <div className="l">Schools</div>
          </div>
          <div>
            <div className="n">∞</div>
            <div className="l">Questions</div>
          </div>
        </div>
      </div>

      <div className="np-aside-block">
        <div className="head">Sections of the Paper</div>
        <ul className="np-era-list">
          <li className={isAll ? "active" : ""} onClick={() => router.push("/")}>
            <span>All Departments</span>
            <span className="num">{total}</span>
          </li>
          {eras.map((era) => (
            <li key={era} className={activeEra === era ? "active" : ""} onClick={() => apply(era)}>
              <span>{era}</span>
            </li>
          ))}
        </ul>
      </div>

      {schools.length > 0 && (
        <div className="np-aside-block">
          <div className="head">Schools of Thought</div>
          <ul className="np-era-list">
            {schools.filter(isCleanSchool).slice(0, 12).map((school) => (
              <li
                key={school}
                className={activeSchool === school ? "active" : ""}
                onClick={() => apply(undefined, school)}
                style={{ fontSize: 13.5 }}
              >
                <span>{school}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="np-aside-block">
        <div className="head">Quotation of the Day</div>
        <div className="np-quote">
          {quote.text}
          <span className="who">&mdash; {quote.who}</span>
        </div>
      </div>
    </aside>
  );
}
