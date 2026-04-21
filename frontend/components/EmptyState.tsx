export default function EmptyState({ query }: { query?: string }) {
  return (
    <div className="empty">
      <div className="icon">🏛️</div>
      <h3>No philosophers found</h3>
      <p>
        {query
          ? `No results for "${query}". Try a different name or idea.`
          : "No philosophers match this filter. Try selecting a different era or school."}
      </p>
      <a href="/" style={{ color: "var(--cyan)", fontSize: 13 }}>← Back to all philosophers</a>
    </div>
  );
}
