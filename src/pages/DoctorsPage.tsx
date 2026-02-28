import { useNavigate, useSearchParams } from "react-router-dom";
import { UserX, AlertCircle, Heart } from "lucide-react";
import { apiGet } from "../api/client";
import { useApi } from "../hooks/useApi";
import { useBookingStore } from "../store/booking";
import { useFavoritesStore } from "../store/favorites";
import DoctorCard from "../components/DoctorCard";
import PageTransition from "../components/ui/PageTransition";
import SkeletonList from "../components/ui/SkeletonList";
import EmptyState from "../components/ui/EmptyState";
import PullToRefresh from "../components/ui/PullToRefresh";
import Badge from "../components/ui/Badge";
import type { Doctor, Clinic, Specialization } from "../types";

/** Extract first specialization name for a doctor, given a specializations map. */
function getSpecName(
  doctor: Doctor,
  specsMap: Record<string, string>,
  filterSpecId?: string
): string {
  for (const cl of doctor.clinics || []) {
    for (const sp of cl.specializations || []) {
      if (filterSpecId && sp.specializationId === filterSpecId) {
        return specsMap[sp.specializationId] || "";
      }
      if (!filterSpecId && specsMap[sp.specializationId]) {
        return specsMap[sp.specializationId];
      }
    }
  }
  return "";
}

/** Extract clinic name for a doctor, given a clinics map. */
function getClinicName(
  doctor: Doctor,
  clinicsMap: Record<string, string>,
  filterClinicId?: string
): string {
  for (const cl of doctor.clinics || []) {
    if (filterClinicId && cl.clinicId === filterClinicId) {
      return clinicsMap[cl.clinicId] || "";
    }
    if (!filterClinicId && clinicsMap[cl.clinicId]) {
      return clinicsMap[cl.clinicId];
    }
  }
  return "";
}

export default function DoctorsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const clinicId = searchParams.get("clinicId") || "";
  const specializationId = searchParams.get("specializationId") || "";
  const showFavorites = searchParams.get("favorites") === "true";

  const { setDoctorId, setClinicId, setSpecializationId } = useBookingStore();
  const { favorites } = useFavoritesStore();

  // Fetch doctors
  const { data: doctors, loading, error, refetch } = useApi<Doctor[]>(() => {
    if (showFavorites) {
      if (favorites.length === 0) return Promise.resolve([]);
      return apiGet("/doctors", { include: "description,specializations,services" });
    }
    const params: Record<string, string> = {
      include: "description,specializations,services",
    };
    if (clinicId) params.clinicId = clinicId;
    if (specializationId) params.specializationId = specializationId;
    return apiGet("/doctors", params);
  }, [clinicId, specializationId, showFavorites]);

  // Fetch clinics + specializations for labels
  const { data: clinicsData } = useApi<Clinic[]>(
    () => apiGet("/clinics"),
    []
  );
  const { data: specsData } = useApi<Specialization[]>(
    () => apiGet("/specializations"),
    []
  );

  const clinicsMap: Record<string, string> = {};
  (clinicsData || []).forEach((c) => {
    clinicsMap[c.id] = c.shortAddress || c.name;
  });

  const specsMap: Record<string, string> = {};
  (specsData || []).forEach((s) => {
    specsMap[s.id] = s.name;
  });

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

  let list = Array.isArray(doctors) ? doctors : [];

  // Filter to favorites if requested
  if (showFavorites) {
    const favIds = new Set(favorites.map((f) => f.id));
    list = list.filter((d) => favIds.has(d.id));
  }

  const title = showFavorites ? "Избранные врачи" : "Врачи";

  return (
    <PageTransition>
      <PullToRefresh onRefresh={refetch}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
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
            showFavorites ? (
              <EmptyState
                icon={Heart}
                title="Нет избранных врачей"
                description="Нажмите ♥ на карточке врача, чтобы добавить в избранное"
                action={{ label: "Найти врачей", onClick: () => navigate("/") }}
              />
            ) : (
              <EmptyState
                icon={UserX}
                title="Врачи не найдены"
                description="Попробуйте изменить параметры поиска"
                action={{ label: "Изменить фильтры", onClick: () => navigate(-1) }}
              />
            )
          ) : (
            list.map((doctor) => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                specializationName={getSpecName(doctor, specsMap, specializationId || undefined)}
                clinicName={getClinicName(doctor, clinicsMap, clinicId || undefined)}
                onBook={() => handleBook(doctor)}
              />
            ))
          )}
        </div>
      </PullToRefresh>
    </PageTransition>
  );
}
