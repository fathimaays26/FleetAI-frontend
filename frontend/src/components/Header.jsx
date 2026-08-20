export function Header({ title, description }) {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        borderBottom: "1px solid #e5e7eb",
        background: "#ffffff",
        padding: "0 24px",
        height: "64px",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
          <h2
            style={{
              margin: 0,
              fontSize: "1rem",
              fontWeight: 600,
              color: "#111827",
            }}
          >
            {title}
          </h2>
          {description && (
            <p style={{ margin: 0, fontSize: "0.875rem", color: "#6b7280" }}>
              {description}
            </p>
          )}
        </div>
      </div>

      <div style={{ position: "relative", width: "280px", maxWidth: "100%" }}>
        <input
          type="search"
          placeholder="Search VIN, vehicle or component..."
          style={{
            width: "100%",
            height: "36px",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            padding: "0 12px",
            fontSize: "0.875rem",
            boxSizing: "border-box",
          }}
        />
      </div>

      <button
        type="button"
        style={{
          border: "1px solid #e5e7eb",
          background: "#f9fafb",
          borderRadius: "8px",
          padding: "8px 12px",
          cursor: "pointer",
        }}
      >
        🔔
      </button>

      <button
        type="button"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          border: "1px solid #e5e7eb",
          background: "#f9fafb",
          borderRadius: "8px",
          padding: "8px 12px",
          cursor: "pointer",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "28px",
            height: "28px",
            borderRadius: "999px",
            background: "#e0f2fe",
            color: "#0f172a",
            fontSize: "0.75rem",
            fontWeight: 700,
          }}
        >
          DW
        </span>
        <span style={{ color: "#111827", fontSize: "0.875rem" }}>
          Dana Whitfield
        </span>
        <span aria-hidden="true">▼</span>
      </button>
    </header>
  );
}
