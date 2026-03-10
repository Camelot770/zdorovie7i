import { useState, useMemo, useRef, useEffect } from "react";
import { ChevronDown, Stethoscope, ArrowRight, Heart, Briefcase } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import Avatar from "./ui/Avatar";
import { useFavoritesStore } from "../store/favorites";
import type { Specialization, Service, Doctor } from "../types";

interface Props {
  specializations: Specialization[];
  servicesBySpec: Record<string, Service[]>;
  doctors: Doctor[];
  clinicId?: string;
  onSelectDoctor: (doctor: Doctor, serviceId?: string, specId?: string, specName?: string) => void;
  onSelectSpec: (specId: string, specName: string) => void;
  loading?: boolean;
}

/** Find doctors that provide a given service under a specialization (optionally in a clinic) */
function filterDoctors(
  doctors: Doctor[],
  specId: string,
  serviceId: string,
  clinicId?: string
): Doctor[] {
  return doctors.filter((doc) =>
    (doc.clinics || []).some((cl) => {
      if (clinicId && cl.clinicId !== clinicId) return false;
      return (cl.specializations || []).some(
        (sp) =>
          sp.specializationId === specId &&
          (sp.services || []).some((s) => s.serviceId === serviceId)
      );
    })
  );
}

function DoctorMiniCard({
  doctor,
  onBook,
}: {
  doctor: Doctor;
  onBook: () => void;
}) {
  const name =
    doctor.name ||
    [doctor.lastName, doctor.firstName, doctor.middleName]
      .filter(Boolean)
      .join(" ");

  const { isFavorite, toggle } = useFavoritesStore();
  const fav = isFavorite(doctor.id);

  function handleFav(e: React.MouseEvent) {
    e.stopPropagation();
    try {
      window.WebApp?.HapticFeedback?.impactOccurred?.("light");
    } catch {
      /* noop */
    }
    toggle({ id: doctor.id, name });
  }

  return (
    <div className="flex items-center gap-3 py-2.5">
      <Avatar name={name} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium text-gray-900 truncate">
            {name}
          </span>
          <button
            onClick={handleFav}
            className="p-0.5 rounded hover:bg-gray-50 flex-shrink-0"
          >
            <Heart
              className={clsx(
                "w-3.5 h-3.5 transition-colors",
                fav ? "fill-rose-500 text-rose-500" : "text-gray-300"
              )}
            />
          </button>
        </div>
        {doctor.experience != null && (
          <p className="flex items-center gap-1 text-[11px] text-gray-500">
            <Briefcase className="w-3 h-3 text-gray-400" />
            Стаж: {doctor.experience} лет
          </p>
        )}
      </div>
      <button
        onClick={onBook}
        className="flex items-center gap-1 bg-primary-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-primary-700 active:scale-95 transition-all flex-shrink-0"
      >
        Записаться
        <ArrowRight className="w-3 h-3" />
      </button>
    </div>
  );
}

export default function SpecializationAccordion({
  specializations,
  servicesBySpec,
  doctors,
  clinicId,
  onSelectDoctor,
  onSelectSpec,
  loading = false,
}: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<{
    specId: string;
    serviceId: string;
  } | null>(null);
  const doctorListRef = useRef<HTMLDivElement>(null);

  // Only show specializations that have services
  const visible = specializations.filter((s) => servicesBySpec[s.id]?.length);

  // Filtered doctors for the selected service
  const matchingDoctors = useMemo(() => {
    if (!selectedService) return [];
    return filterDoctors(
      doctors,
      selectedService.specId,
      selectedService.serviceId,
      clinicId
    );
  }, [doctors, selectedService, clinicId]);

  // Auto-scroll to doctor list when it appears (wait for both accordion + doctor list animations)
  useEffect(() => {
    if (selectedService && matchingDoctors.length > 0) {
      setTimeout(() => {
        doctorListRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 350);
    }
  }, [selectedService, matchingDoctors.length]);

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (visible.length === 0) {
    return (
      <div className="text-center text-gray-500 text-sm py-6">
        Нет доступных специальностей
      </div>
    );
  }

  function handleToggle(specId: string) {
    const opening = expandedId !== specId;
    setExpandedId(opening ? specId : null);
    if (!opening) setSelectedService(null);
  }

  function handleServiceClick(specId: string, serviceId: string) {
    if (
      selectedService?.specId === specId &&
      selectedService?.serviceId === serviceId
    ) {
      setSelectedService(null);
    } else {
      setSelectedService({ specId, serviceId });
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Специальность
      </label>
      {visible.map((spec) => {
        const isOpen = expandedId === spec.id;
        const services = servicesBySpec[spec.id] || [];
        const minPrice = services[0]?.price;

        return (
          <div
            key={spec.id}
            className="bg-white rounded-xl border border-gray-100 shadow-card overflow-hidden"
          >
            {/* Header */}
            <button
              type="button"
              onClick={() => handleToggle(spec.id)}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                <Stethoscope className="w-4 h-4 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="block text-sm font-medium text-gray-900 truncate">
                  {spec.name}
                </span>
                {!isOpen && minPrice != null && (
                  <span className="block text-xs text-gray-500 mt-0.5">
                    от {minPrice.toLocaleString("ru-RU")} ₽
                  </span>
                )}
              </div>
              <ChevronDown
                className={clsx(
                  "w-4 h-4 text-gray-400 transition-transform flex-shrink-0",
                  isOpen && "rotate-180"
                )}
              />
            </button>

            {/* Expandable services list + doctors */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-3">
                    <div className="border-t border-gray-100 pt-1">
                      {services.map((svc) => {
                        const isSelected =
                          selectedService?.specId === spec.id &&
                          selectedService?.serviceId === svc.id;
                        return (
                          <button
                            key={svc.id}
                            type="button"
                            onClick={() =>
                              handleServiceClick(spec.id, svc.id)
                            }
                            className={clsx(
                              "w-full flex items-center justify-between py-2.5 px-2 -mx-2 rounded-lg text-left transition-colors",
                              isSelected
                                ? "bg-primary-50 border border-primary-200"
                                : "hover:bg-gray-50 border border-transparent"
                            )}
                          >
                            <span
                              className={clsx(
                                "text-sm pr-3 leading-snug",
                                isSelected
                                  ? "text-primary-700 font-medium"
                                  : "text-gray-700"
                              )}
                            >
                              {svc.name}
                            </span>
                            <span className="text-sm font-semibold text-gray-900 whitespace-nowrap flex-shrink-0">
                              {svc.price?.toLocaleString("ru-RU")} ₽
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Matching doctors for selected service */}
                    <AnimatePresence>
                      {selectedService?.specId === spec.id &&
                        matchingDoctors.length > 0 && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="overflow-hidden"
                          >
                            <div ref={doctorListRef} className="border-t border-gray-100 mt-2 pt-2">
                              <p className="text-xs font-medium text-gray-500 mb-1">
                                Врачи ({matchingDoctors.length})
                              </p>
                              <div className="divide-y divide-gray-50">
                                {matchingDoctors.map((doc) => (
                                  <DoctorMiniCard
                                    key={doc.id}
                                    doctor={doc}
                                    onBook={() => onSelectDoctor(doc, selectedService?.serviceId, spec.id, spec.name)}
                                  />
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Show all doctors for this spec */}
                    <button
                      type="button"
                      onClick={() => onSelectSpec(spec.id, spec.name)}
                      className="w-full mt-2 text-xs text-primary-600 font-medium py-2 hover:text-primary-700 transition-colors"
                    >
                      Все врачи по специальности →
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
