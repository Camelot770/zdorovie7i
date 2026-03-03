import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarPlus, Shield, AlertCircle, UserPlus } from "lucide-react";
import { apiGet } from "../api/client";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../hooks/useAuth";
import RecordCard from "../components/RecordCard";
import PageTransition from "../components/ui/PageTransition";
import SkeletonList from "../components/ui/SkeletonList";
import EmptyState from "../components/ui/EmptyState";
import PullToRefresh from "../components/ui/PullToRefresh";
import Badge from "../components/ui/Badge";
import type { Appointment } from "../types";

function friendlyRecordsError(raw: string): string {
  if (raw.includes("Load failed") || raw.includes("Failed to fetch") || raw.includes("NetworkError")) {
    return "Нет связи с сервером. Проверьте интернет и попробуйте снова.";
  }
  if (raw.includes("502") || raw.includes("503") || raw.includes("504")) {
    return "Сервер временно недоступен. Попробуйте через минуту.";
  }
  return "Не удалось загрузить список записей. Попробуйте обновить.";
}

export default function MyRecordsPage() {
  const navigate = useNavigate();
  const { patientId, maxUserId, loading: authLoading } = useAuth();

  // 1C API requires DD.MM.YYYY format
  const fmt = (d: Date) => `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
  const today = fmt(new Date());
  const end = fmt(new Date(Date.now() + 180 * 86400000));

  const {
    data: records,
    loading,
    error,
    refetch,
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

  // Sort: active/planned first (by nearest date), canceled at the bottom
  const list = useMemo(() => {
    const raw = Array.isArray(records) ? records : [];
    return [...raw].sort((a, b) => {
      const aCanceled = a.canceled ? 1 : 0;
      const bCanceled = b.canceled ? 1 : 0;
      // Canceled go to the bottom
      if (aCanceled !== bCanceled) return aCanceled - bCanceled;
      // Within same group — sort by appointmentAt ascending (nearest first)
      const dateA = a.appointmentAt ? new Date(a.appointmentAt).getTime() : 0;
      const dateB = b.appointmentAt ? new Date(b.appointmentAt).getTime() : 0;
      return dateA - dateB;
    });
  }, [records]);

  // Distinguish "not linked" (has maxUserId but no patientId) from "not authenticated"
  const notLinked = !patientId && !!maxUserId;

  return (
    <PageTransition>
      <PullToRefresh onRefresh={refetch}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Мои записи</h2>
            {list.length > 0 && (
              <Badge variant="neutral">Записей: {list.length}</Badge>
            )}
          </div>

          {authLoading || loading ? (
            <SkeletonList count={3} />
          ) : notLinked ? (
            <EmptyState
              icon={UserPlus}
              title="Аккаунт не привязан"
              description="Привяжите аккаунт к медкарте в разделе «Профиль», чтобы видеть свои записи"
              action={{ label: "Перейти в профиль", onClick: () => navigate("/profile") }}
            />
          ) : !patientId ? (
            <EmptyState
              icon={Shield}
              title="Требуется авторизация"
              description="Откройте приложение через бот для авторизации"
              action={{ label: "На главную", onClick: () => navigate("/") }}
            />
          ) : error ? (
            <EmptyState
              icon={AlertCircle}
              title="Ошибка загрузки"
              description={friendlyRecordsError(error)}
              action={{ label: "Повторить", onClick: refetch }}
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
      </PullToRefresh>
    </PageTransition>
  );
}
