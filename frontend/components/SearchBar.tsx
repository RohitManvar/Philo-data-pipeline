"use client";
import { useState } from "react";
import { useRouter } from "next/router";

const searchIcon = (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

export default function SearchBar({ defaultValue = "", compact = false }: { defaultValue?: string; compact?: boolean }) {
  const [query, setQuery] = useState(defaultValue);
  const router = useRouter();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(query.trim() ? `/?q=${encodeURIComponent(query.trim())}` : "/");
  };

  if (compact) {
    return (
      <form onSubmit={submit} className="nav-search" style={{ position: "relative" }}>
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 16, color: "var(--ink-soft)", display: "flex" }}>
          {searchIcon}
        </span>
        <input
          type="text" value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="Search philosophers…"
        />
      </form>
    );
  }

  return (
    <form onSubmit={submit} className="hero-search">
      <span style={{ position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)", width: 20, color: "var(--indigo)", display: "flex" }}>
        {searchIcon}
      </span>
      <input
        type="text" value={query} onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name, ideas, era…"
      />
    </form>
  );
}
