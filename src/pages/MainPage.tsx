import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiGet } from "../api/client";
import { useApi } from "../hooks/useApi";
import { useBookingStore } from "../store/booking";
import { Search, HeartPulse } from "lucide-react";
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
        <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl p-4 shadow-lg flex items-center gap-3.5 relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10" />
          <div className="absolute -right-2 bottom-0 w-16 h-16 rounded-full bg-white/5" />
          <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
            <HeartPulse className="w-6 h-6 text-white" />
          </div>
          <div className="relative z-10">
            <h2 className="text-[15px] font-bold text-white">Запись на приём</h2>
            <p className="text-[12px] text-white/80 mt-0.5">Выберите параметры для поиска врача</p>
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
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3.5 rounded-xl font-semibold shadow-md shadow-primary-600/30 hover:shadow-lg hover:shadow-primary-600/40 active:scale-[0.97] transition-all duration-200"
        >
          <Search className="w-[18px] h-[18px]" />
          Найти врачей
        </button>
      </div>
    </PageTransition>
  );
}
