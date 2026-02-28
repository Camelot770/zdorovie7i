import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiPost } from "../api/client";

export default function CancelPage() {
  const navigate = useNavigate();
  const { recordId } = useParams<{ recordId: string }>();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleCancel() {
    if (!recordId) return;
    setSubmitting(true);
    setError("");

    try {
      await apiPost(`/records/${recordId}/cancel`);
      setDone(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ошибка при отмене записи"
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="text-5xl">&#x274c;</div>
        <h2 className="text-xl font-semibold text-gray-900">
          Запись отменена
        </h2>
        <p className="text-sm text-gray-500">
          Вы можете записаться повторно в любое время.
        </p>
        <button
          onClick={() => navigate("/")}
          className="bg-primary-600 text-white px-6 py-2 rounded-lg text-sm"
        >
          На главную
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 py-8">
      <h2 className="text-lg font-semibold text-gray-900 text-center">
        Отмена записи
      </h2>

      <p className="text-center text-gray-600">
        Вы уверены, что хотите отменить запись?
      </p>

      {error && (
        <p className="text-red-500 text-sm text-center">{error}</p>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm hover:bg-gray-50"
        >
          Нет, оставить
        </button>
        <button
          onClick={handleCancel}
          disabled={submitting}
          className="flex-1 bg-red-500 text-white py-2.5 rounded-lg text-sm hover:bg-red-600 disabled:opacity-50"
        >
          {submitting ? "Отменяем..." : "Да, отменить"}
        </button>
      </div>
    </div>
  );
}
