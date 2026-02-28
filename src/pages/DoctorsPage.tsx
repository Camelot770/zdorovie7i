import { useNavigate, useSearchParams } from "react-router-dom";
import { apiGet } from "../api/client";
import { useApi } from "../hooks/useApi";
import { useBookingStore } from "../store/booking";
import DoctorCard from "../components/DoctorCard";
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

    if (clinicId) {
      setClinicId(clinicId);
    }
    if (specializationId) {
      setSpecializationId(specializationId);
    }

    navigate(`/slots/${doctor.id}`);
  }

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-500">Загрузка врачей...</div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">Ошибка загрузки</p>
        <button
          onClick={() => navigate(-1)}
          className="text-primary-600 text-sm"
        >
          Назад
        </button>
      </div>
    );
  }

  const list = Array.isArray(doctors) ? doctors : [];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Врачи</h2>
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-primary-600"
        >
          Назад
        </button>
      </div>

      {list.length === 0 ? (
        <p className="text-center text-gray-500 py-8">
          Врачи не найдены. Попробуйте изменить фильтры.
        </p>
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
  );
}
