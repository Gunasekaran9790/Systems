
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserRound,
  Package,
  X,
  ChevronDown,
  UserPlus,
  List,
} from "lucide-react";

type SidebarProps = {
  mobileOpen: boolean;
  onClose: () => void;
};

const menus = [
  {
    label: "Users",
    path: "/users",
    icon: Users,
    children: [
      { label: "All Users", path: "/users", icon: List, end: true },
      { label: "Add User", path: "/users/add", icon: UserPlus },
    ],
  },
  {
    label: "Customers",
    path: "/customers",
    icon: UserRound,
    children: [
      {
        label: "All Customers",
        path: "/customers",
        icon: List,
        end: true,
      },
      {
        label: "Add Customer",
        path: "/customers/add",
        icon: UserPlus,
      },
    ],
  },
  {
    label: "Products",
    path: "/products",
    icon: Package,
    children: [
      {
        label: "All Products",
        path: "/products",
        icon: List,
        end: true,
      },
      {
        label: "Add Product",
        path: "/products/add",
        icon: Package,
      },
    ],
  },
];

export default function Sidebar({
  mobileOpen,
  onClose,
}: SidebarProps) {
  const location = useLocation();

  const [openMenus, setOpenMenus] = useState<string[]>(() =>
    menus
      .filter((menu) => location.pathname.startsWith(menu.path))
      .map((menu) => menu.label)
  );

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
      isActive
        ? "bg-indigo-50 text-indigo-700"
        : "text-slate-600 hover:bg-slate-100"
    }`;

  return (
    <>
      {/* Mobile overlay */}
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
        {/* Header */}
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

        {/* Navigation */}
        <nav className="flex-1 space-y-2 overflow-y-auto p-4">
          <NavLink
            to="/dashboard"
            onClick={onClose}
            className={linkClass}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </NavLink>

          {menus.map(({ label, path, icon: Icon, children }) => {
            const isOpen = openMenus.includes(label);
            const isSectionActive = location.pathname.startsWith(path);

            return (
              <div key={label}>
                {/* Parent menu */}
                <button
                  type="button"
                  onClick={() => toggleMenu(label)}
                  aria-expanded={isOpen}
                  className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    isSectionActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon size={20} />
                    {label}
                  </span>

                  <ChevronDown
                    size={16}
                    className={`transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Submenu */}
                {isOpen && (
                  <div className="ml-4 mt-2 space-y-1 border-l border-slate-200 pl-3">
                    {children.map(
                      ({ label: childLabel, path: childPath, icon: ChildIcon, end }) => (
                        <NavLink
                          key={childPath}
                          to={childPath}
                          end={end}
                          onClick={onClose}
                          className={linkClass}
                        >
                          <ChildIcon size={18} />
                          {childLabel}
                        </NavLink>
                      )
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t p-4 text-xs text-slate-500">
          Admin Dashboard
        </div>
      </aside>
    </>
  );
}
