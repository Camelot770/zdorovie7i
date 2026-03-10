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
  Unlink,
  User,
  Search,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useFavoritesStore } from "../store/favorites";
import { useBookingStore } from "../store/booking";
import { apiPost } from "../api/client";
import PageTransition from "../components/ui/PageTransition";
import Avatar from "../components/ui/Avatar";
import EmptyState from "../components/ui/EmptyState";
import type { Patient } from "../types";

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

type LinkStep = "phone" | "confirm" | "pick" | "register";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { patientId, patientName, maxUserId, loading, setPatientId, resetPatient } = useAuth();
  const { favorites } = useFavoritesStore();
  const resetBooking = useBookingStore((s) => s.reset);

  const [linkStep, setLinkStep] = useState<LinkStep>("phone");
  const [linkPhone, setLinkPhone] = useState("+7");
  const [foundPatients, setFoundPatients] = useState<Patient[]>([]);
  const [linkedResult, setLinkedResult] = useState<{ patientId: string; fullName: string } | null>(null);
  const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false);
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

  function friendlyError(err: unknown, fallback: string): string {
    if (!(err instanceof Error)) return fallback;
    const msg = err.message;
    if (msg.includes("Load failed") || msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
      return "Нет связи с сервером. Проверьте интернет и попробуйте снова.";
    }
    if (msg.includes("502") || msg.includes("503")) {
      return "Сервер временно недоступен. Попробуйте позже.";
    }
    if (msg.includes("404")) {
      return fallback;
    }
    if (msg.startsWith("API error")) {
      return fallback;
    }
    return msg;
  }

  async function handleLink() {
    const phoneDigits = linkPhone.replace(/\D/g, "");
    if (phoneDigits.length < 11) {
      setError("Введите номер телефона полностью");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const result = await apiPost<{
        status: string;
        patientId?: string;
        fullName?: string;
        patients?: Patient[];
      }>("/auth/link", { max_user_id: maxUserId, phone: linkPhone });

      if (result.status === "linked" && result.patientId) {
        // Don't auto-accept — show confirmation so user can reject if wrong person
        setLinkedResult({ patientId: result.patientId, fullName: result.fullName || "" });
        setLinkStep("confirm");
      } else if (result.status === "multiple" && result.patients?.length) {
        setFoundPatients(result.patients);
        setLinkStep("pick");
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes("404")) {
        // Patient not found → offer registration
        setForm({ ...emptyForm, phone: linkPhone });
        setLinkStep("register");
        setError("");
        return;
      }
      setError(friendlyError(err, "Ошибка поиска пациента. Попробуйте позже."));
    } finally {
      setSubmitting(false);
    }
  }

  function handleConfirmLink() {
    if (linkedResult) {
      setPatientId(linkedResult.patientId, linkedResult.fullName);
      setLinkedResult(null);
    }
  }

  async function handleRejectLink() {
    // User said "this isn't me" — unlink and show registration form
    setSubmitting(true);
    setError("");
    try {
      await apiPost("/auth/unlink", { max_user_id: maxUserId });
    } catch {
      // Ignore unlink errors — we proceed to registration anyway
    } finally {
      setSubmitting(false);
    }
    setLinkedResult(null);
    setForm({ ...emptyForm, phone: linkPhone });
    setLinkStep("register");
  }

  async function handlePickPatient(patient: Patient) {
    setSubmitting(true);
    setError("");

    try {
      const result = await apiPost<{
        status: string;
        patientId: string;
        fullName: string;
      }>(`/auth/link/${patient.id}?max_user_id=${maxUserId}`);

      setPatientId(result.patientId, result.fullName);
    } catch (err) {
      setError(friendlyError(err, "Ошибка привязки. Попробуйте позже."));
    } finally {
      setSubmitting(false);
    }
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
      setPatientId(result.patientId, result.fullName);
      setLinkStep("phone");
    } catch (err) {
      setError(friendlyError(err, "Ошибка регистрации. Попробуйте позже."));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUnlink() {
    setSubmitting(true);
    setError("");
    try {
      await apiPost("/auth/unlink", { max_user_id: maxUserId });
      resetPatient();
      setShowUnlinkConfirm(false);
      setForm(emptyForm);
      setLinkStep("phone");
      setLinkPhone("+7");
    } catch (err) {
      setError(friendlyError(err, "Ошибка отвязки. Попробуйте позже."));
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
      sublabel: "+7 (843) 204-27-00",
      onClick: () => { try { window.open("tel:+78432042700"); } catch { /* noop */ } },
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
            <Avatar name={patientName || fullName} size="lg" />
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-gray-900 truncate">{fullName}</h2>
              {patientId ? (
                <>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="w-2 h-2 rounded-full bg-success-500" />
                    <span className="text-xs text-success-600 font-medium">Привязан к клинике</span>
                  </div>
                  {patientName && (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <User className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">{patientName}</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="w-2 h-2 rounded-full bg-warning-500" />
                  <span className="text-xs text-warning-600 font-medium">Не зарегистрирован</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Patient info + unlink */}
        {patientId && !showUnlinkConfirm && (
          <button
            onClick={() => setShowUnlinkConfirm(true)}
            className="w-full flex items-center gap-3 bg-white rounded-2xl p-4 shadow-card border border-gray-100 text-left hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
              <Unlink className="w-5 h-5 text-orange-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">Сменить данные пациента</p>
              <p className="text-xs text-gray-500">Отвязать аккаунт и перерегистрироваться</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
          </button>
        )}

        {/* Unlink confirmation */}
        {patientId && showUnlinkConfirm && (
          <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100 space-y-3">
            <p className="text-sm text-orange-800">
              Вы уверены? Текущая привязка к пациенту{patientName ? ` "${patientName}"` : ""} будет удалена. После этого можно зарегистрироваться заново с правильными данными.
            </p>
            {error && (
              <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => { setShowUnlinkConfirm(false); setError(""); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleUnlink}
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-60 transition-all"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Unlink className="w-4 h-4" />
                )}
                {submitting ? "Отвязка..." : "Отвязать"}
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Phone linking (primary flow) */}
        {!patientId && linkStep === "phone" && (
          <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                <Phone className="w-4 h-4 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Привязка к клинике</h3>
                <p className="text-xs text-gray-500">Введите номер телефона из карты пациента</p>
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Телефон</label>
              <input
                type="tel"
                value={linkPhone}
                onChange={(e) => { setLinkPhone(e.target.value); setError(""); }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="+7 (999) 123-45-67"
              />
            </div>

            {error && (
              <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              onClick={handleLink}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-700 disabled:opacity-60 active:scale-[0.97] transition-all"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              {submitting ? "Поиск..." : "Найти"}
            </button>

            <p className="text-xs text-gray-400 text-center">
              Если вы ранее были пациентом клиники, мы найдём вашу карту по телефону
            </p>

            <button
              type="button"
              onClick={() => { setForm(emptyForm); setLinkStep("register"); setError(""); }}
              className="w-full text-xs text-primary-600 font-medium py-1"
            >
              Зарегистрировать нового пациента →
            </button>
          </div>
        )}

        {/* Step 1b: Confirm found patient */}
        {!patientId && linkStep === "confirm" && linkedResult && (
          <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100 space-y-3">
            <h3 className="font-semibold text-gray-900 text-sm">Найден пациент</h3>
            <p className="text-xs text-gray-500">Это вы?</p>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-primary-50 border border-primary-100">
              <Avatar name={linkedResult.fullName} size="sm" />
              <p className="text-sm font-medium text-gray-900">{linkedResult.fullName}</p>
            </div>

            {error && (
              <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleRejectLink}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-60 transition-colors"
              >
                {submitting ? "Отвязка..." : "Нет, это не я"}
              </button>
              <button
                onClick={handleConfirmLink}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                Да, привязать
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Multiple patients found — pick one */}
        {!patientId && linkStep === "pick" && (
          <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100 space-y-3">
            <h3 className="font-semibold text-gray-900 text-sm">Найдено несколько пациентов</h3>
            <p className="text-xs text-gray-500">Выберите свою карту пациента:</p>

            <div className="space-y-2">
              {foundPatients.map((patient) => {
                const name = [patient.lastName, patient.firstName, patient.middleName]
                  .filter(Boolean)
                  .join(" ");
                return (
                  <button
                    key={patient.id}
                    onClick={() => handlePickPatient(patient)}
                    disabled={submitting}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-primary-50 hover:border-primary-200 active:bg-primary-100 transition-colors text-left disabled:opacity-60"
                  >
                    <Avatar name={name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
                      {patient.birthDate && (
                        <p className="text-xs text-gray-500">{patient.birthDate}</p>
                      )}
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-gray-300 flex-shrink-0" />
                  </button>
                );
              })}
            </div>

            {error && (
              <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => { setLinkStep("phone"); setError(""); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Назад
              </button>
              <button
                onClick={() => { setForm({ ...emptyForm, phone: linkPhone }); setLinkStep("register"); setError(""); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-primary-600 hover:bg-primary-50 transition-colors"
              >
                Новый пациент
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Registration form (fallback when patient not found) */}
        {!patientId && linkStep === "register" && (
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
                onClick={() => { setLinkStep("phone"); setError(""); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Назад
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
                  onClick={() => { resetBooking(); navigate(`/slots/${doc.id}`); }}
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
