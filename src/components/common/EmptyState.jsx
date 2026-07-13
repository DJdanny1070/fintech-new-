/**
 * EmptyState — professional empty placeholder for modules with no data.
 *
 * Props:
 *   icon        — optional emoji or JSX icon element
 *   title       — primary heading (default: "Nothing here yet")
 *   description — secondary descriptive text
 *   action      — optional JSX action button/link
 */
export default function EmptyState({
  icon = null,
  title = "Nothing here yet",
  description = "",
  action = null,
}) {
  return (
    <div
      role="status"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--sp-12) var(--sp-6)",
        textAlign: "center",
        color: "var(--text-muted)",
        gap: "var(--sp-3)",
      }}
    >
      {icon && (
        <div
          style={{
            fontSize: 36,
            opacity: 0.45,
            marginBottom: "var(--sp-1)",
            lineHeight: 1,
          }}
          aria-hidden="true"
        >
          {icon}
        </div>
      )}
      <div
        style={{
          fontSize: 15,
          fontWeight: 700,
          color: "var(--text-primary)",
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </div>
      {description && (
        <div style={{ fontSize: 13, color: "var(--text-muted)", maxWidth: 320, lineHeight: 1.6 }}>
          {description}
        </div>
      )}
      {action && <div style={{ marginTop: "var(--sp-2)" }}>{action}</div>}
    </div>
  );
}
