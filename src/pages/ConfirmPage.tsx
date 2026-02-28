import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost } from "../api/client";
import { useBookingStore } from "../store/booking";
import { useAuth } from "../hooks/useAuth";

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Подтверждение записи
        </h2>
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-primary-600"
        >
          Назад
        </button>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 space-y-3">
        <div>
          <p className="text-xs text-gray-500">Врач</p>
          <p className="font-medium text-gray-900">{doctorName || "—"}</p>
        </div>
        {specializationName && (
          <div>
            <p className="text-xs text-gray-500">Специальность</p>
            <p className="text-gray-900">{specializationName}</p>
          </div>
        )}
        <div>
          <p className="text-xs text-gray-500">Дата и время</p>
          <p className="font-medium text-gray-900">
            {dateStr}, {timeStr}
          </p>
        </div>
        {clinicName && (
          <div>
            <p className="text-xs text-gray-500">Филиал</p>
            <p className="text-gray-900">{clinicName}</p>
          </div>
        )}
      </div>

      {error && (
        <p className="text-red-500 text-sm text-center">{error}</p>
      )}

      <button
        onClick={handleConfirm}
        disabled={submitting}
        className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
      >
        {submitting ? "Создаём запись..." : "Подтвердить запись"}
      </button>
    </div>
  );
}
