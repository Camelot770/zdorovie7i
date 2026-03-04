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

interface MainPageData {
  clinics: Clinic[];
  specializations: Specialization[];
  doctors: Doctor[];
  services: Service[];
}

/**
 * Try the combined endpoint first; if it fails (404 = backend not deployed yet),
 * fall back to individual parallel calls.
 */
async function fetchMainPageData(): Promise<MainPageData> {
  try {
    return await apiGet<MainPageData>("/main-page-data");
  } catch {
    // Fallback: load individually (parallel where possible)
    const [clinics, specializations, doctors] = await Promise.all([
      apiGet<Clinic[]>("/clinics"),
      apiGet<Specialization[]>("/specializations"),
      apiGet<Doctor[]>("/doctors", { include: "specializations,services" }),
    ]);

    // Collect serviceIds from doctors and load services
    const ids = collectServiceIds(doctors || []);
    let services: Service[] = [];
    if (ids.length > 0) {
      const CHUNK = 40;
      const chunks: string[][] = [];
      for (let i = 0; i < ids.length; i += CHUNK) {
        chunks.push(ids.slice(i, i + CHUNK));
      }
      const results = await Promise.all(
        chunks.map((c) => apiGet<Service[]>("/services", { serviceIds: c.join(",") }))
      );
      services = results.flat();
    }

    return {
      clinics: clinics || [],
      specializations: specializations || [],
      doctors: doctors || [],
      services,
    };
  }
}

export default function MainPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const {
    clinicId,
    setClinicId,
    setSpecializationId,
    setDoctorId,
    setServiceIds,
  } = useBookingStore();

  // Single call with automatic fallback to individual endpoints
  const { data: mainData, loading } = useApi<MainPageData>(
    fetchMainPageData,
    []
  );

  const clinics = mainData?.clinics || [];
  const specializations = mainData?.specializations || [];
  const doctors = mainData?.doctors || [];
  const services = mainData?.services || [];

  // Build specialization → services mapping
  const servicesBySpec = useMemo(
    () => groupServicesBySpecialization(doctors, services, clinicId || undefined),
    [doctors, services, clinicId]
  );

  useEffect(() => {
    const preselectedClinic = searchParams.get("clinicId");
    if (preselectedClinic && clinics.length > 0) {
      const clinic = clinics.find((c) => c.id === preselectedClinic);
      if (clinic) {
        setClinicId(clinic.id, clinic.shortAddress || clinic.name);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, clinics]);

  function handleDoctorSelect(doctor: Doctor, serviceId?: string) {
    const name =
      doctor.name ||
      [doctor.lastName, doctor.firstName, doctor.middleName]
        .filter(Boolean)
        .join(" ");
    setDoctorId(doctor.id, name);
    // Save selected serviceId (from accordion) or clear it
    setServiceIds(serviceId || "");
    navigate(`/slots/${doctor.id}`);
  }

  function handleSpecSelect(specId: string, specName: string) {
    setSpecializationId(specId, specName);
    const params = new URLSearchParams();
    if (clinicId) params.set("clinicId", clinicId);
    params.set("specializationId", specId);
    navigate(`/doctors?${params.toString()}`);
  }

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

        {loading ? (
          <SkeletonCard lines={2} />
        ) : (
          <ClinicSelect
            clinics={clinics}
            value={clinicId}
            onChange={setClinicId}
            loading={false}
          />
        )}

        <DoctorSearch
          clinicId={clinicId}
          specializationId=""
          onSelect={handleDoctorSelect}
        />

        {loading ? (
          <div className="space-y-2">
            <SkeletonCard lines={1} />
            <SkeletonCard lines={1} />
            <SkeletonCard lines={1} />
          </div>
        ) : (
          <SpecializationAccordion
            specializations={specializations}
            servicesBySpec={servicesBySpec}
            doctors={doctors}
            clinicId={clinicId || undefined}
            onSelectDoctor={handleDoctorSelect}
            onSelectSpec={handleSpecSelect}
          />
        )}
      </div>
    </PageTransition>
  );
}
