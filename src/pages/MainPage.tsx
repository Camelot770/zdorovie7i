import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiGet } from "../api/client";
import { useApi } from "../hooks/useApi";
import { useBookingStore } from "../store/booking";
import AgeToggle from "../components/AgeToggle";
import ClinicSelect from "../components/ClinicSelect";
import SpecializationSelect from "../components/SpecializationSelect";
import DoctorSearch from "../components/DoctorSearch";
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
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Запись на приём</h2>

      <AgeToggle isChild={isChild} onChange={setIsChild} />

      <ClinicSelect
        clinics={clinics || []}
        value={clinicId}
        onChange={setClinicId}
        loading={clinicsLoading}
      />

      <SpecializationSelect
        specializations={specializations || []}
        value={specializationId}
        onChange={setSpecializationId}
        loading={specsLoading}
      />

      <DoctorSearch
        clinicId={clinicId}
        specializationId={specializationId}
        onSelect={handleDoctorSelect}
      />

      <button
        onClick={handleSearch}
        className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
      >
        Найти врачей
      </button>

      <button
        onClick={() => navigate("/records")}
        className="w-full border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors"
      >
        Мои записи
      </button>
    </div>
  );
}
