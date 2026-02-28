import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Stethoscope, Calendar, Building2, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { apiPost } from "../api/client";
import { useBookingStore } from "../store/booking";
import { useAuth } from "../hooks/useAuth";
import PageTransition from "../components/ui/PageTransition";

export default function ConfirmPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { patientId } = useAuth();

  const {
    clinicId,
    doctorId,
    specializationId,
    appointmentAt,
    clinicName,
    doctorName,
    specializationName,
  } = useBookingStore();

  const dateStr = appointmentAt
    ? new Date(appointmentAt).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";
  const timeStr = appointmentAt ? appointmentAt.slice(11, 16) : "";

  async function handleConfirm() {
    if (!patientId) {
      setError("Необходима авторизация для записи");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await apiPost("/records", {
        appointmentAt,
        clinicId,
        doctorId,
        specializationId,
        patientId,
      });
      navigate("/success");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ошибка при создании записи"
      );
    } finally {
      setSubmitting(false);
    }
  }

  const details = [
    { icon: User, label: "Врач", value: doctorName },
    { icon: Stethoscope, label: "Специальность", value: specializationName },
    { icon: Calendar, label: "Дата и время", value: dateStr ? `${dateStr}, ${timeStr}` : null },
    { icon: Building2, label: "Филиал", value: clinicName },
  ].filter((d) => d.value);

  return (
    <PageTransition>
      <div className="space-y-4">
        <div className="bg-white rounded-xl p-4 shadow-card border border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Подтверждение записи</h2>
            <p className="text-xs text-gray-500">Проверьте данные перед записью</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-card border border-gray-100 divide-y divide-gray-50">
          {details.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
              <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon className="w-4 h-4 text-gray-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500">{label}</p>
                <p className="font-medium text-gray-900 text-sm">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-danger-50 text-danger-700 text-sm p-3 rounded-lg">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <button
          onClick={handleConfirm}
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 active:scale-[0.98] disabled:opacity-50 transition-all"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Создаём запись...
            </>
          ) : (
            "Подтвердить запись"
          )}
        </button>
      </div>
    </PageTransition>
  );
}
