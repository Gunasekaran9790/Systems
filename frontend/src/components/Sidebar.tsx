import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, X } from "lucide-react";

type SidebarProps = {
  mobileOpen: boolean;
  onClose: () => void;
};

const links = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Users", path: "/users", icon: Users },
];

export default function Sidebar({
  mobileOpen,
  onClose,
}: SidebarProps) {
  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col
          border-r border-slate-200 bg-white transition-transform
          duration-200 md:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-16 items-center justify-between border-b px-5">
          <span className="text-xl font-bold text-indigo-600">
            Admin Portal
          </span>

          <button
            type="button"
            aria-label="Close navigation"
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-slate-100 md:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-2 p-4">
          {links.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t p-4 text-xs text-slate-500">
          Admin Dashboard
        </div>
      </aside>
    </>
  );
}