import { NavLink, useLocation } from "react-router-dom";
import {
  ShieldCheck,
  LayoutGrid,
  Sparkles,
  Cpu,
  Settings,
  LogOut,
} from "lucide-react";

const navItems = [
  { to: "/", label: "Overview", icon: LayoutGrid },
  { to: "/ai-assistant", label: "AI Assistant", icon: Sparkles },
  {
    to: "/predictive-failure-engine",
    label: "Predictive Failure Engine",
    icon: Cpu,
    isModule: true,
  },
];

const predictiveSubItems = [
    {
    to: "/predictive-failure-engine/rule-builder",
    label: "Rule Builder",
  },
    {
    to: "/predictive-failure-engine/failure-probability",
    label: "Failure Probability",
  },
  
  {
    to: "/predictive-failure-engine/rul-explorer",
    label: "RUL Explorer",
  },
];

export default function Sidebar() {
  const location = useLocation();

  // True when we are anywhere inside Predictive Failure Engine
  const isPredictiveActive =
    location.pathname.startsWith("/predictive-failure-engine");

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5 text-white" />
        </div>

        <div>
          <div className="font-semibold text-gray-900 leading-tight">
            FleetGuard AI
          </div>
          <div className="text-xs text-gray-400 leading-tight">
            Predictive Maintenance
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="px-5 mt-2">
        <div className="text-xs font-medium text-gray-400 tracking-wide mb-2">
          NAVIGATION
        </div>

        <nav className="space-y-1">
          {navItems.map(({ to, label, icon: Icon, isModule }) => {
            const isActive = isModule
              ? isPredictiveActive
              : location.pathname === to;

            return (
              <div key={to}>
                <NavLink
                  to={to}
                  end={to === "/"}
                  className={
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ` +
                    `${
                      isActive
                        ? "bg-indigo-50 text-indigo-600 font-medium"
                        : "text-gray-600 hover:bg-gray-50"
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />

                  <span className="flex-1">{label}</span>

                  {/* Arrow only when PFE is open */}
                  {isModule && isPredictiveActive && (
                    <span className="text-indigo-500 text-xs">⌄</span>
                  )}

                  {/* Arrow when PFE is closed */}
                  {isModule && !isPredictiveActive && (
                    <span className="text-gray-400 text-xs">›</span>
                  )}
                </NavLink>

                {/* PFE sub-navigation */}
                {isModule && isPredictiveActive && (
                  <div className="mt-1 ml-4 pl-3 border-l border-gray-200">
                    <div className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase py-2">
                      Module
                    </div>

                    <div className="space-y-1">
                      {predictiveSubItems.map(({ to, label }) => (
                        <NavLink
                          key={to}
                          to={to}
                          className={({ isActive }) =>
                            `block px-3 py-2 rounded-lg text-sm transition-colors ${
                              isActive
                                ? "bg-indigo-50 text-indigo-600 font-medium"
                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                            }`
                          }
                        >
                          {label}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* User + settings */}
      <div className="px-5 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600 shrink-0">
            DW
          </div>

          <div>
            <div className="text-sm font-medium text-gray-900 leading-tight">
              Dana Whitfield
            </div>
            <div className="text-xs text-gray-400 leading-tight">
              Fleet Operations
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            <Settings className="w-4 h-4" />
            Settings
          </button>

          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}