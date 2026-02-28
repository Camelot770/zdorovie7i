import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiGet } from "../api/client";
import { useApi } from "../hooks/useApi";
import { useBookingStore } from "../store/booking";
import { Search, Activity } from "lucide-react";
import AgeToggle from "../components/AgeToggle";
import ClinicSelect from "../components/ClinicSelect";
import SpecializationSelect from "../components/SpecializationSelect";
import DoctorSearch from "../components/DoctorSearch";
import PageTransition from "../components/ui/PageTransition";
import SkeletonCard from "../components/ui/SkeletonCard";
import type { Clinic, Specialization, Doctor } from "../types";

export default function MainPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const {
    isChild,
    clinicId,
    specializationId,
    setIsChild,
    setClinicId,
    setSpecializationId,
    setDoctorId,
  } = useBookingStore();

  const { data: clinics, loading: clinicsLoading } = useApi<Clinic[]>(
    () => apiGet("/clinics"),
    []
  );

  const { data: specializations, loading: specsLoading } = useApi<Specialization[]>(
    () => apiGet("/specializations", isChild ? { age: "true" } : {}),
    [isChild]
  );

  useEffect(() => {
    const preselectedClinic = searchParams.get("clinicId");
    if (preselectedClinic && clinics) {
      const clinic = clinics.find((c) => c.id === preselectedClinic);
      if (clinic) {
        setClinicId(clinic.id, clinic.shortAddress || clinic.name);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, clinics]);

  function handleDoctorSelect(doctor: Doctor) {
    const name =
      doctor.name ||
      [doctor.lastName, doctor.firstName, doctor.middleName]
        .filter(Boolean)
        .join(" ");
    setDoctorId(doctor.id, name);
    navigate(`/slots/${doctor.id}`);
  }

  function handleSearch() {
    const params = new URLSearchParams();
    if (clinicId) params.set("clinicId", clinicId);
    if (specializationId) params.set("specializationId", specializationId);
    if (isChild) params.set("isChild", "true");
    navigate(`/doctors?${params.toString()}`);
  }

  return (
    <PageTransition>
      <div className="space-y-4">
        <div className="bg-white rounded-xl p-4 shadow-card border border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
            <Activity className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Запись на приём</h2>
            <p className="text-xs text-gray-500">Выберите параметры для поиска врача</p>
          </div>
        </div>

        <AgeToggle isChild={isChild} onChange={setIsChild} />

        {clinicsLoading ? (
          <SkeletonCard lines={2} />
        ) : (
          <ClinicSelect
            clinics={clinics || []}
            value={clinicId}
            onChange={setClinicId}
            loading={clinicsLoading}
          />
        )}

        {specsLoading ? (
          <SkeletonCard lines={2} />
        ) : (
          <SpecializationSelect
            specializations={specializations || []}
            value={specializationId}
            onChange={setSpecializationId}
            loading={specsLoading}
          />
        )}

        <DoctorSearch
          clinicId={clinicId}
          specializationId={specializationId}
          onSelect={handleDoctorSelect}
        />

        <button
          onClick={handleSearch}
          className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 active:scale-[0.98] transition-all"
        >
          <Search className="w-4 h-4" />
          Найти врачей
        </button>
      </div>
    </PageTransition>
  );
}
