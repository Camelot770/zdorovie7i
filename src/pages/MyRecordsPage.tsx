import { useNavigate } from "react-router-dom";
import { CalendarPlus, Shield, AlertCircle } from "lucide-react";
import { apiGet } from "../api/client";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../hooks/useAuth";
import RecordCard from "../components/RecordCard";
import PageTransition from "../components/ui/PageTransition";
import SkeletonList from "../components/ui/SkeletonList";
import EmptyState from "../components/ui/EmptyState";
import Badge from "../components/ui/Badge";
import type { Appointment } from "../types";

export default function MyRecordsPage() {
  const navigate = useNavigate();
  const { patientId, loading: authLoading } = useAuth();

  const today = new Date().toISOString().split("T")[0];
  const end = new Date(Date.now() + 60 * 86400000).toISOString().split("T")[0];

  const {
    data: records,
    loading,
    error,
  } = useApi<Appointment[]>(
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

  const list = Array.isArray(records) ? records : [];

  return (
    <PageTransition>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Мои записи</h2>
          {list.length > 0 && (
            <Badge variant="neutral">Записей: {list.length}</Badge>
          )}
        </div>

        {authLoading || loading ? (
          <SkeletonList count={3} />
        ) : !patientId ? (
          <EmptyState
            icon={Shield}
            title="Требуется авторизация"
            description="Для просмотра записей необходимо авторизоваться через бот"
            action={{ label: "На главную", onClick: () => navigate("/") }}
          />
        ) : error ? (
          <EmptyState
            icon={AlertCircle}
            title="Ошибка загрузки"
            description="Не удалось загрузить список записей"
            action={{ label: "На главную", onClick: () => navigate("/") }}
          />
        ) : list.length === 0 ? (
          <EmptyState
            icon={CalendarPlus}
            title="Нет предстоящих записей"
            description="У вас пока нет записей на ближайшее время"
            action={{ label: "Записаться на приём", onClick: () => navigate("/") }}
          />
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
    </PageTransition>
  );
}
