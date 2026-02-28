import { useNavigate } from "react-router-dom";
import { apiGet } from "../api/client";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../hooks/useAuth";
import RecordCard from "../components/RecordCard";
import type { Record } from "../types";

export default function MyRecordsPage() {
  const navigate = useNavigate();
  const { patientId, loading: authLoading } = useAuth();

  const today = new Date().toISOString().split("T")[0];
  const end = new Date(Date.now() + 60 * 86400000).toISOString().split("T")[0];

  const {
    data: records,
    loading,
    error,
  } = useApi<Record[]>(
    () => {
      if (!patientId) return Promise.resolve([]);
      return apiGet("/records", {
        beginDate: today,
        endDate: end,
        patientId,
      });
    },
    [patientId]
  );

  if (authLoading || loading) {
    return (
      <div className="text-center py-8 text-gray-500">Загрузка записей...</div>
    );
  }

  if (!patientId) {
    return (
      <div className="text-center py-8 space-y-4">
        <p className="text-gray-500">
          Для просмотра записей необходимо авторизоваться через бот.
        </p>
        <button
          onClick={() => navigate("/")}
          className="text-primary-600 text-sm"
        >
          На главную
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">Ошибка загрузки записей</p>
        <button
          onClick={() => navigate("/")}
          className="text-primary-600 text-sm"
        >
          На главную
        </button>
      </div>
    );
  }

  const list = Array.isArray(records) ? records : [];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Мои записи</h2>
        <button
          onClick={() => navigate("/")}
          className="text-sm text-primary-600"
        >
          На главную
        </button>
      </div>

      {list.length === 0 ? (
        <div className="text-center py-8 space-y-4">
          <p className="text-gray-500">Предстоящих записей нет</p>
          <button
            onClick={() => navigate("/")}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg text-sm"
          >
            Записаться на приём
          </button>
        </div>
      ) : (
        list.map((record) => (
          <RecordCard
            key={record.id}
            record={record}
            onCancel={() => navigate(`/cancel/${record.id}`)}
          />
        ))
      )}
    </div>
  );
}
