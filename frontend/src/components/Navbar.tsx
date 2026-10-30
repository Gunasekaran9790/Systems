import { useState } from "react";
import { Bell, ChevronDown, LogOut, Menu, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api/client";

type NavbarProps = {
  onMenuClick: () => void;
};

export default function Navbar({ onMenuClick }: NavbarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();

  async function handleLogout() {
    setLoggingOut(true);

    try {
      await apiRequest("/auth/logout", { method: "POST" });
      navigate("/login", { replace: true });
    } catch {
      setLoggingOut(false);
      alert("Logout failed. Please try again.");
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center
      justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="rounded-lg p-2 hover:bg-slate-100 md:hidden"
        >
          <Menu size={22} />
        </button>

        {/* <h1 className="text-lg font-semibold text-slate-800">
          Admin Dashboard
        </h1> */}
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <div className="relative">
          <button
            type="button"
            aria-label="Notifications"
            aria-expanded={notificationsOpen}
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setProfileOpen(false);
            }}
            className="relative rounded-lg p-2 hover:bg-slate-100"
          >
            <Bell size={21} />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl
              border bg-white p-4 shadow-lg">
              <p className="font-semibold">Notifications</p>
              <p className="mt-2 text-sm text-slate-500">
                You’re all caught up.
              </p>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            aria-expanded={profileOpen}
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotificationsOpen(false);
            }}
            className="flex items-center gap-2 rounded-lg p-2 hover:bg-slate-100"
          >
            <span className="flex h-8 w-8 items-center justify-center
              rounded-full bg-indigo-100 text-indigo-700">
              <User size={18} />
            </span>

            <span className="hidden text-sm font-medium sm:block">
              My Account
            </span>
            <ChevronDown size={16} />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-44 rounded-xl
              border bg-white p-2 shadow-lg">
              <button
                type="button"
                disabled={loggingOut}
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-lg
                  px-3 py-2 text-sm text-red-600 hover:bg-red-50
                  disabled:opacity-50"
              >
                <LogOut size={17} />
                {loggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}