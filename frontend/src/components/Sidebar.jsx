import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/overview", label: "Overview" },
  { to: "/ai-assistant", label: "AI Assistant" },
  { to: "/predictive-failure", label: "Predictive Failure Engine" },
];

export function Sidebar() {
  return (
    <aside
      style={{
        width: "256px",
        minWidth: "256px",
        borderRight: "1px solid #e5e7eb",
        background: "#f8fafc",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "14px 16px",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "#0f172a",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
          }}
        >
          F
        </div>
        <div>
          <div
            style={{ fontSize: "0.875rem", fontWeight: 700, color: "#111827" }}
          >
            FleetGuard AI
          </div>
          <div style={{ fontSize: "0.7rem", color: "#64748b" }}>
            Predictive Maintenance
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: "16px 12px" }}>
        <p
          style={{
            margin: "0 0 10px",
            fontSize: "0.68rem",
            fontWeight: 700,
            color: "#64748b",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
        
        </p>
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {navItems.map((item) => (
            <li key={item.to} style={{ marginBottom: "6px" }}>
              <NavLink
                to={item.to}
                style={({ isActive }) => ({
                  width: "100%",
                  display: "block",
                  textAlign: "left",
                  border: "none",
                  borderRadius: "8px",
                  padding: "10px 12px",
                  background: isActive ? "#e0f2fe" : "transparent",
                  color: isActive ? "#0f172a" : "#475569",
                  fontWeight: isActive ? 600 : 500,
                  cursor: "pointer",
                  textDecoration: "none",
                })}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div style={{ borderTop: "1px solid #e5e7eb", padding: "12px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "8px 6px",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "999px",
              background: "#e0f2fe",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#0f172a",
              fontWeight: 700,
            }}
          >
            D
          </div>
          <div>
            <div
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#111827",
              }}
            >
              Dana Whitfield
            </div>
            <div style={{ fontSize: "0.68rem", color: "#64748b" }}>
              Fleet Operations
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
          <button
            type="button"
            style={{
              flex: 1,
              border: "1px solid #e5e7eb",
              background: "#fff",
              borderRadius: "8px",
              padding: "8px 10px",
              cursor: "pointer",
            }}
          >
            Settings
          </button>
          <button
            type="button"
            style={{
              flex: 1,
              border: "1px solid #e5e7eb",
              background: "#fff",
              borderRadius: "8px",
              padding: "8px 10px",
              cursor: "pointer",
            }}
          >
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}
