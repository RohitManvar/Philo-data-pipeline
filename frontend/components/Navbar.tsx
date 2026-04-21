import Link from "next/link";
import SearchBar from "./SearchBar";
import ThemeToggle from "./ThemeToggle";

export default function Navbar({ showSearch = false }: { showSearch?: boolean }) {
  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link href="/" className="logo">
          <span className="logo-mark">
            Enlyghten<span className="dot">.</span>
          </span>
          <span className="logo-sub hidden sm:block">Encyclopedia of Thought</span>
        </Link>

        {showSearch && (
          <div className="nav-search">
            <SearchBar compact />
          </div>
        )}

        <div className="nav-eras hidden sm:flex">
          <Link href="/" className="nav-era">All</Link>
          <Link href="/?era=Ancient" className="nav-era">Ancient</Link>
          <Link href="/?era=Modern" className="nav-era">Modern</Link>
          <Link href="/?era=Eastern" className="nav-era">Eastern</Link>
        </div>

        <ThemeToggle />
      </div>
    </nav>
  );
}
