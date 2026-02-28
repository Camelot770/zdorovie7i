import { useNavigate, useSearchParams } from "react-router-dom";
import { UserX, AlertCircle } from "lucide-react";
import { apiGet } from "../api/client";
import { useApi } from "../hooks/useApi";
import { useBookingStore } from "../store/booking";
import DoctorCard from "../components/DoctorCard";
import PageTransition from "../components/ui/PageTransition";
import SkeletonList from "../components/ui/SkeletonList";
import EmptyState from "../components/ui/EmptyState";
import Badge from "../components/ui/Badge";
import type { Doctor } from "../types";

export default function DoctorsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const clinicId = searchParams.get("clinicId") || "";
  const specializationId = searchParams.get("specializationId") || "";

  const { setDoctorId, setClinicId, setSpecializationId } = useBookingStore();

  const { data: doctors, loading, error } = useApi<Doctor[]>(() => {
    const params: Record<string, string> = {
      include: "description,specializations",
    };
    if (clinicId) params.clinicId = clinicId;
    if (specializationId) params.specializationId = specializationId;
    return apiGet("/doctors", params);
  }, [clinicId, specializationId]);

  function handleBook(doctor: Doctor) {
    const name =
      doctor.name ||
      [doctor.lastName, doctor.firstName, doctor.middleName]
        .filter(Boolean)
        .join(" ");

    setDoctorId(doctor.id, name);
    if (clinicId) setClinicId(clinicId);
    if (specializationId) setSpecializationId(specializationId);

    navigate(`/slots/${doctor.id}`);
  }

  const list = Array.isArray(doctors) ? doctors : [];

  return (
    <PageTransition>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Врачи</h2>
          {list.length > 0 && (
            <Badge variant="neutral">Найдено: {list.length}</Badge>
          )}
        </div>

        {loading ? (
          <SkeletonList count={4} showAvatar />
        ) : error ? (
          <EmptyState
            icon={AlertCircle}
            title="Ошибка загрузки"
            description="Не удалось загрузить список врачей"
            action={{ label: "Назад", onClick: () => navigate(-1) }}
          />
        ) : list.length === 0 ? (
          <EmptyState
            icon={UserX}
            title="Врачи не найдены"
            description="Попробуйте изменить параметры поиска"
            action={{ label: "Изменить фильтры", onClick: () => navigate(-1) }}
          />
        ) : (
          list.map((doctor) => (
            <DoctorCard
              key={doctor.id}
              doctor={doctor}
              onBook={() => handleBook(doctor)}
            />
          ))
        )}
      </div>
    </PageTransition>
  );
}
