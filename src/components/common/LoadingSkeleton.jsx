/**
 * LoadingSkeleton — animated shimmer placeholder for content loading states.
 * Use in place of raw content while async data is fetched.
 *
 * Props:
 *   rows    — number of skeleton rows to render (default: 3)
 *   height  — height of each row in px (default: 48)
 *   gap     — gap between rows in px (default: 8)
 */
export default function LoadingSkeleton({ rows = 3, height = 48, gap = 8 }) {
  return (
    <div
      role="status"
      aria-label="Loading content"
      style={{ display: "grid", gap }}
    >
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height, borderRadius: 8 }} />
      ))}
      {/* Screen-reader live region announces loading */}
      <span className="sr-only">Loading…</span>
    </div>
  );
}
