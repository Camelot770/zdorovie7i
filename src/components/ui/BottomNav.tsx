import { useLocation, useNavigate } from "react-router-dom";
import { Home, Stethoscope, CalendarCheck, User } from "lucide-react";
import clsx from "clsx";

const tabs = [
  { path: "/", label: "Главная", icon: Home },
  { path: "/doctors", label: "Врачи", icon: Stethoscope },
  { path: "/records", label: "Записи", icon: CalendarCheck },
  { path: "/profile", label: "Профиль", icon: User },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  function handleNav(path: string) {
    try { window.WebApp?.HapticFeedback?.selectionChanged?.(); } catch { /* noop */ }
    navigate(path);
  }

  function isActive(path: string) {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-lg mx-auto flex">
        {tabs.map(({ path, label, icon: Icon }) => {
          const active = isActive(path);
          return (
            <button
              key={path}
              onClick={() => handleNav(path === "/profile" ? "/records" : path)}
              className={clsx(
                "flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors",
                active ? "text-primary-600" : "text-gray-400"
              )}
            >
              <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
