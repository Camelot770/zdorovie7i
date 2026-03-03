import { useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiGet } from "../api/client";
import { useApi } from "../hooks/useApi";
import { useBookingStore } from "../store/booking";
import { HeartPulse } from "lucide-react";
import ClinicSelect from "../components/ClinicSelect";
import SpecializationAccordion from "../components/SpecializationAccordion";
import DoctorSearch from "../components/DoctorSearch";
import PageTransition from "../components/ui/PageTransition";
import SkeletonCard from "../components/ui/SkeletonCard";
import { groupServicesBySpecialization, collectServiceIds } from "../utils/prices";
import type { Clinic, Specialization, Doctor, Service } from "../types";

export default function MainPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const {
    clinicId,
    setClinicId,
    setSpecializationId,
    setDoctorId,
  } = useBookingStore();

  const { data: clinics, loading: clinicsLoading } = useApi<Clinic[]>(
    () => apiGet("/clinics"),
    []
  );

  const { data: specializations, loading: specsLoading } = useApi<Specialization[]>(
    () => apiGet("/specializations"),
    []
  );

  // Load doctors (with services structure) to map services to specializations
  const { data: doctors, loading: docsLoading } = useApi<Doctor[]>(
    () => apiGet("/doctors", { include: "specializations,services" }),
    []
  );

  // Collect all serviceIds and load full data (names + prices) in batches
  const allServiceIds = useMemo(
    () => collectServiceIds(doctors || [], clinicId || undefined),
    [doctors, clinicId]
  );

  const serviceIdsKey = allServiceIds.join(",");
  const { data: servicesData, loading: svcLoading } = useApi<Service[]>(
    () => {
      if (allServiceIds.length === 0) return Promise.resolve([]);
      // Split into chunks of 40 to avoid 431 (URL too long)
      const CHUNK = 40;
      const chunks: string[][] = [];
      for (let i = 0; i < allServiceIds.length; i += CHUNK) {
        chunks.push(allServiceIds.slice(i, i + CHUNK));
      }
      return Promise.all(
        chunks.map((ids) => apiGet<Service[]>("/services", { serviceIds: ids.join(",") }))
      ).then((results) => results.flat());
    },
    [serviceIdsKey]
  );

  // Build specialization → services mapping
  const servicesBySpec = useMemo(
    () =>
      groupServicesBySpecialization(
        doctors || [],
        servicesData || [],
        clinicId || undefined
      ),
    [doctors, servicesData, clinicId]
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

  function handleSpecSelect(specId: string, specName: string) {
    setSpecializationId(specId, specName);
    const params = new URLSearchParams();
    if (clinicId) params.set("clinicId", clinicId);
    params.set("specializationId", specId);
    navigate(`/doctors?${params.toString()}`);
  }

  const dataLoading = docsLoading || svcLoading;

  return (
    <PageTransition>
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl p-4 shadow-lg flex items-center gap-3.5 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10" />
          <div className="absolute -right-2 bottom-0 w-16 h-16 rounded-full bg-white/5" />
          <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
            <HeartPulse className="w-6 h-6 text-white" />
          </div>
          <div className="relative z-10">
            <h2 className="text-[15px] font-bold text-white">Запись на приём</h2>
            <p className="text-[12px] text-white/80 mt-0.5">Выберите специальность или найдите врача</p>
          </div>
        </div>

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

        <DoctorSearch
          clinicId={clinicId}
          specializationId=""
          onSelect={handleDoctorSelect}
        />

        {specsLoading || dataLoading ? (
          <div className="space-y-2">
            <SkeletonCard lines={1} />
            <SkeletonCard lines={1} />
            <SkeletonCard lines={1} />
          </div>
        ) : (
          <SpecializationAccordion
            specializations={specializations || []}
            servicesBySpec={servicesBySpec}
            doctors={doctors || []}
            clinicId={clinicId || undefined}
            onSelectDoctor={handleDoctorSelect}
            onSelectSpec={handleSpecSelect}
          />
        )}
      </div>
    </PageTransition>
  );
}
