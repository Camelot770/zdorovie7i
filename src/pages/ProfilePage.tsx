import { useNavigate } from "react-router-dom";
import {
  Heart,
  Calendar,
  Phone,
  Shield,
  ChevronRight,
  LogOut,
  Stethoscope,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useFavoritesStore } from "../store/favorites";
import PageTransition from "../components/ui/PageTransition";
import Avatar from "../components/ui/Avatar";
import EmptyState from "../components/ui/EmptyState";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { patientId, maxUserId, loading } = useAuth();
  const { favorites } = useFavoritesStore();

  // Get user info from WebApp if available
  const firstName = window.WebApp?.initDataUnsafe?.user?.first_name || "";
  const lastName = window.WebApp?.initDataUnsafe?.user?.last_name || "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ") || "Пользователь";

  if (loading) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </PageTransition>
    );
  }

  if (!maxUserId) {
    return (
      <PageTransition>
        <EmptyState
          icon={Shield}
          title="Требуется авторизация"
          description="Откройте приложение через бот в MAX мессенджере"
          action={{ label: "На главную", onClick: () => navigate("/") }}
        />
      </PageTransition>
    );
  }

  const menuItems = [
    {
      icon: Calendar,
      label: "Мои записи",
      sublabel: "Предстоящие приёмы",
      onClick: () => navigate("/records"),
      color: "text-primary-600",
      bg: "bg-primary-50",
    },
    {
      icon: Heart,
      label: "Избранные врачи",
      sublabel: favorites.length > 0 ? `${favorites.length} врачей` : "Пока нет",
      onClick: () => navigate("/doctors?favorites=true"),
      color: "text-rose-500",
      bg: "bg-rose-50",
    },
    {
      icon: Phone,
      label: "Контакт-центр",
      sublabel: "+7 (843) 240-60-70",
      onClick: () => { try { window.open("tel:+78432406070"); } catch { /* noop */ } },
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
  ];

  function handleLogout() {
    localStorage.removeItem("max_user_id");
    localStorage.removeItem("fav_doctors");
    try { window.WebApp?.close?.(); } catch { /* noop */ }
    navigate("/");
    window.location.reload();
  }

  return (
    <PageTransition>
      <div className="space-y-4">
        {/* User card */}
        <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100">
          <div className="flex items-center gap-4">
            <Avatar name={fullName} size="lg" />
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-gray-900 truncate">{fullName}</h2>
              {patientId ? (
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="w-2 h-2 rounded-full bg-success-500" />
                  <span className="text-xs text-success-600 font-medium">Привязан к клинике</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="w-2 h-2 rounded-full bg-warning-500" />
                  <span className="text-xs text-warning-600 font-medium">Телефон не привязан</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Menu items */}
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 divide-y divide-gray-50 overflow-hidden">
          {menuItems.map(({ icon: Icon, label, sublabel, onClick, color, bg }) => (
            <button
              key={label}
              onClick={onClick}
              className="w-full flex items-center gap-3.5 px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
            >
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{label}</p>
                <p className="text-xs text-gray-500 truncate">{sublabel}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
            </button>
          ))}
        </div>

        {/* Favorite doctors quick list */}
        {favorites.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Избранные врачи</h3>
              <button
                onClick={() => navigate("/doctors?favorites=true")}
                className="text-xs text-primary-600 font-medium"
              >
                Все →
              </button>
            </div>
            <div className="space-y-2">
              {favorites.slice(0, 3).map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => navigate(`/slots/${doc.id}`)}
                  className="w-full flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
                >
                  <Avatar name={doc.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                  </div>
                  <Stethoscope className="w-4 h-4 text-gray-300" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-500 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 active:scale-[0.97] transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          Выйти
        </button>
      </div>
    </PageTransition>
  );
}
