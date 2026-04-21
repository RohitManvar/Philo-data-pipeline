import { useRouter } from "next/router";
import Counter from "./Counter";

interface Props {
  eras: string[];
  schools: string[];
  activeEra?: string;
  activeSchool?: string;
  total: number;
}

const SWATCH: Record<string, string> = {
  ancient:       "#818cf8",
  medieval:      "#c4b5fd",
  renaissance:   "#f9a8d4",
  enlightenment: "#7dd3fc",
  modern:        "#93c5fd",
  contemporary:  "#6ee7b7",
  eastern:       "#fcd34d",
  islamic:       "#5eead4",
  african:       "#fde047",
};

function swatchColor(era: string): string {
  const key = era.toLowerCase();
  for (const [k, v] of Object.entries(SWATCH)) {
    if (key.includes(k)) return v;
  }
  return "#94a3b8";
}

export default function FilterSidebar({ eras, schools, activeEra, activeSchool, total }: Props) {
  const router = useRouter();

  const apply = (era?: string, school?: string) => {
    const q: Record<string, string> = {};
    if (era) q.era = era;
    if (school) q.school = school;
    router.push({ pathname: "/", query: q });
  };

  const isAll = !activeEra && !activeSchool;

  return (
    <aside className="w-56 shrink-0">
      <div className="side-card text-center">
        <div className="side-stat" style={{ justifyContent: "center" }}>
          <span className="num"><Counter value={total} /></span>
        </div>
        <span className="lab" style={{ fontSize: 11, letterSpacing: ".15em", textTransform: "uppercase", color: "var(--ink-soft)" }}>Thinkers</span>
        <p className="side-meta">Across {eras.length} eras · {schools.length} schools</p>
      </div>

      <div className="side-card" style={{ padding: 8 }}>
        <button onClick={() => router.push("/")} className={`era-item${isAll ? " active" : ""}`}>
          <span className="left">
            <span className="swatch" style={{ background: "#6366f1", color: "#6366f1" }} />
            All Philosophers
          </span>
          <span className="count">{total}</span>
        </button>
      </div>

      {eras.length > 0 && (
        <div className="side-card">
          <p className="side-h">By Era</p>
          {eras.map((era) => (
            <button key={era} onClick={() => apply(era)} className={`era-item${activeEra === era ? " active" : ""}`}>
              <span className="left">
                <span className="swatch" style={{ background: swatchColor(era), color: swatchColor(era) }} />
                {era}
              </span>
            </button>
          ))}
        </div>
      )}

      {schools.length > 0 && (
        <div className="side-card">
          <p className="side-h">By School</p>
          <div className="school-list">
            {schools.slice(0, 28).map((school) => (
              <button
                key={school}
                onClick={() => apply(undefined, school)}
                className={`school-item${activeSchool === school ? " active" : ""}`}
                style={activeSchool === school ? { background: "rgba(99,102,241,0.15)", color: "#c7d2fe", borderColor: "rgba(99,102,241,0.35)" } : {}}
              >
                {school}
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
