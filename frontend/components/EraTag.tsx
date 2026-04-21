const ERA_CLASS: Record<string, string> = {
  ancient:       "era-ancient",
  medieval:      "era-medieval",
  renaissance:   "era-renaissance",
  enlightenment: "era-enlightenment",
  modern:        "era-modern",
  contemporary:  "era-contemporary",
  eastern:       "era-eastern",
  islamic:       "era-islamic",
  african:       "era-african",
};

function eraClass(era: string): string {
  const key = era.toLowerCase();
  for (const [k, v] of Object.entries(ERA_CLASS)) {
    if (key.includes(k)) return v;
  }
  return "era-default";
}

export default function EraTag({ era }: { era: string | null }) {
  if (!era) return null;
  return <span className={`era-badge ${eraClass(era)}`}>{era}</span>;
}
