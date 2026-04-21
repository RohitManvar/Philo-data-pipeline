import { useEffect, useState } from "react";

export default function Loader() {
  const [hidden, setHidden] = useState(false);
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setHidden(true), 900);
    const t2 = setTimeout(() => setRemoved(true), 1700);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (removed) return null;

  return (
    <div className={`loader${hidden ? " hidden" : ""}`}>
      <div className="loader-ring">
        <div className="core" />
      </div>
      <div className="loader-mark">
        Enlyghten<span className="dot">.</span>
      </div>
      <div className="loader-sub">Loading the library of thought</div>
      <div className="loader-bar" />
    </div>
  );
}
