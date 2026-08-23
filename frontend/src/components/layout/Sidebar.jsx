import { NavLink } from "react-router-dom";
import { ShieldCheck, LayoutGrid, Sparkles, Cpu, Settings, LogOut } from "lucide-react";

const navItems = [
  { to: "/", label: "Overview", icon: LayoutGrid },
  { to: "/ai-assistant", label: "AI Assistant", icon: Sparkles },
  { to: "/predictive-failure-engine", label: "Predictive Failure Engine", icon: Cpu },
];

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="font-semibold text-gray-900 leading-tight">FleetGuard AI</div>
          <div className="text-xs text-gray-400 leading-tight">Predictive Maintenance</div>
        </div>
      </div>

      {/* Nav */}
      <div className="px-5 mt-2">
        <div className="text-xs font-medium text-gray-400 tracking-wide mb-2">NAVIGATION</div>
        <nav className="space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-indigo-50 text-indigo-600 font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Spacer pushes profile block to bottom */}
      <div className="flex-1" />

      {/* User + settings */}
      <div className="px-5 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600 shrink-0">
            DW
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900 leading-tight">Dana Whitfield</div>
            <div className="text-xs text-gray-400 leading-tight">Fleet Operations</div>
          </div>
        </div>
        <div className="space-y-1">
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            <Settings className="w-4 h-4" /> Settings
          </button>
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}