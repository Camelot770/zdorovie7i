import { useEffect, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import BottomNav from "./ui/BottomNav";

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";

  // Sync MAX WebApp BackButton with route
  useEffect(() => {
    const bb = window.WebApp?.BackButton;
    if (!bb) return;

    if (isHome) {
      bb.hide();
    } else {
      bb.show();
    }

    const handler = () => navigate(-1);
    bb.onClick(handler);
    return () => bb.offClick(handler);
  }, [isHome, navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-primary-600 text-white px-4 py-3 shadow-sm">
        <div className="max-w-lg mx-auto flex items-center">
          {!isHome && (
            <button
              onClick={() => navigate(-1)}
              className="mr-2 -ml-1 p-1 rounded-lg hover:bg-primary-500 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <h1 className="text-lg font-semibold flex-1 text-center">
            Здоровье семьи
          </h1>
          {!isHome && <div className="w-7" />}
        </div>
      </header>
      <main className="max-w-lg mx-auto px-4 py-4 pb-24">{children}</main>
      <BottomNav />
    </div>
  );
}
