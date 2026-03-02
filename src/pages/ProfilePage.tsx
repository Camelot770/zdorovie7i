import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  Calendar,
  Phone,
  Shield,
  ChevronRight,
  LogOut,
  Stethoscope,
  UserPlus,
  Loader2,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useFavoritesStore } from "../store/favorites";
import { apiPost } from "../api/client";
import PageTransition from "../components/ui/PageTransition";
import Avatar from "../components/ui/Avatar";
import EmptyState from "../components/ui/EmptyState";

interface RegisterForm {
  lastName: string;
  firstName: string;
  middleName: string;
  noMiddleName: boolean;
  gender: string;
  birthDate: string;
  phone: string;
}

const emptyForm: RegisterForm = {
  lastName: "",
  firstName: "",
  middleName: "",
  noMiddleName: false,
  gender: "",
  birthDate: "",
  phone: "+7",
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const { patientId, maxUserId, loading, setPatientId } = useAuth();
  const { favorites } = useFavoritesStore();

  const [showRegister, setShowRegister] = useState(false);
  const [form, setForm] = useState<RegisterForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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

  function handleField(field: keyof RegisterForm, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  }

  async function handleRegister() {
    if (!form.lastName.trim() || !form.firstName.trim()) {
      setError("Заполните фамилию и имя");
      return;
    }
    if (!form.gender) {
      setError("Выберите пол");
      return;
    }
    if (!form.birthDate) {
      setError("Укажите дату рождения");
      return;
    }
    const phoneDigits = form.phone.replace(/\D/g, "");
    if (phoneDigits.length < 11) {
      setError("Введите номер телефона полностью");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const result = await apiPost<{ status: string; patientId: string; fullName: string }>(
        "/auth/register",
        {
          max_user_id: maxUserId,
          lastName: form.lastName.trim(),
          firstName: form.firstName.trim(),
          middleName: form.middleName.trim() || undefined,
          noMiddleName: form.noMiddleName,
          gender: form.gender,
          birthDate: form.birthDate,
          phone: form.phone,
        }
      );
      setPatientId(result.patientId);
      setShowRegister(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Ошибка регистрации";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
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
                  <span className="text-xs text-warning-600 font-medium">Не зарегистрирован</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Registration prompt */}
        {!patientId && !showRegister && (
          <div className="bg-primary-50 rounded-2xl p-4 border border-primary-100">
            <p className="text-sm text-primary-800 mb-3">
              Для записи на приём необходимо зарегистрироваться в системе клиники.
            </p>
            <button
              onClick={() => setShowRegister(true)}
              className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-700 active:scale-[0.97] transition-all"
            >
              <UserPlus className="w-4 h-4" />
              Зарегистрироваться
            </button>
          </div>
        )}

        {/* Registration form */}
        {!patientId && showRegister && (
          <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100 space-y-3">
            <h3 className="font-semibold text-gray-900 text-sm">Регистрация нового пациента</h3>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Фамилия *</label>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => handleField("lastName", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Иванов"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Имя *</label>
              <input
                type="text"
                value={form.firstName}
                onChange={(e) => handleField("firstName", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Иван"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Отчество</label>
              <input
                type="text"
                value={form.middleName}
                onChange={(e) => handleField("middleName", e.target.value)}
                disabled={form.noMiddleName}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-400"
                placeholder="Иванович"
              />
              <label className="flex items-center gap-2 mt-1.5">
                <input
                  type="checkbox"
                  checked={form.noMiddleName}
                  onChange={(e) => {
                    handleField("noMiddleName", e.target.checked);
                    if (e.target.checked) handleField("middleName", "");
                  }}
                  className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-xs text-gray-500">Нет отчества</span>
              </label>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Пол *</label>
              <div className="flex gap-2">
                {[
                  { value: "male", label: "Мужской" },
                  { value: "female", label: "Женский" },
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => handleField("gender", value)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      form.gender === value
                        ? "bg-primary-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Дата рождения *</label>
              <input
                type="date"
                value={form.birthDate}
                onChange={(e) => handleField("birthDate", e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Телефон *</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => handleField("phone", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="+7 (999) 123-45-67"
              />
            </div>

            {error && (
              <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => { setShowRegister(false); setError(""); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleRegister}
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60 transition-all"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                {submitting ? "Регистрация..." : "Зарегистрироваться"}
              </button>
            </div>
          </div>
        )}

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
