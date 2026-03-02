import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { apiGet } from "../api/client";
import { useApi } from "../hooks/useApi";
import { useBookingStore } from "../store/booking";
import Calendar from "../components/Calendar";
import TimeSlots from "../components/TimeSlots";
import PageTransition from "../components/ui/PageTransition";
import Avatar from "../components/ui/Avatar";
import SkeletonCard from "../components/ui/SkeletonCard";
import type { Schedule, AppointmentSlot, Clinic, Specialization } from "../types";

export default function SlotsPage() {
  const navigate = useNavigate();
  const { doctorId } = useParams<{ doctorId: string }>();
  const { clinicId, specializationId, setAppointmentAt, setClinicId, setSpecializationId, doctorName } =
    useBookingStore();

  const [selectedDate, setSelectedDate] = useState("");

  // Fetch clinic/specialization names for confirm page display
  const { data: clinicsData } = useApi<Clinic[]>(() => apiGet("/clinics"), []);
  const { data: specsData } = useApi<Specialization[]>(() => apiGet("/specializations"), []);

  const { data: schedules, loading } = useApi<Schedule[]>(() => {
    const params: Record<string, string> = {
      doctorIds: doctorId || "",
      include: "appointmentSlots",
    };
    if (clinicId) params.clinicIds = clinicId;
    if (specializationId) params.specializationIds = specializationId;
    return apiGet("/schedules", params);
  }, [doctorId, clinicId, specializationId]);

  const availableDates = useMemo(() => {
    const dates = new Set<string>();
    if (!schedules) return dates;
    const list = Array.isArray(schedules) ? schedules : [];
    for (const s of list) {
      if (s.isBusy) continue;
      for (const slot of s.appointmentSlots || []) {
        if (slot.isEmpty) {
          dates.add(slot.startAt.slice(0, 10));
        }
      }
    }
    return dates;
  }, [schedules]);

  const daySlots = useMemo((): AppointmentSlot[] => {
    if (!selectedDate || !schedules) return [];
    const list = Array.isArray(schedules) ? schedules : [];
    const slots: AppointmentSlot[] = [];
    for (const s of list) {
      if (s.isBusy) continue;
      for (const slot of s.appointmentSlots || []) {
        if (slot.startAt.startsWith(selectedDate)) {
          slots.push(slot);
        }
      }
    }
    slots.sort((a, b) => a.startAt.localeCompare(b.startAt));
    return slots;
  }, [selectedDate, schedules]);

  function handleSlotSelect(slot: AppointmentSlot) {
    // Find the schedule that contains this slot to get clinicId + specializationId
    const list = Array.isArray(schedules) ? schedules : [];
    for (const s of list) {
      if (s.isBusy) continue;
      for (const sl of s.appointmentSlots || []) {
        if (sl.startAt === slot.startAt) {
          const clinic = (clinicsData || []).find((c) => c.id === s.clinicId);
          const spec = (specsData || []).find((sp) => sp.id === s.specializationId);
          setClinicId(s.clinicId, clinic?.shortAddress || clinic?.name || "");
          setSpecializationId(s.specializationId, spec?.name || "");
          break;
        }
      }
    }
    setAppointmentAt(slot.startAt);
    navigate("/confirm");
  }

  return (
    <PageTransition>
      <div className="space-y-4">
        {doctorName && (
          <div className="flex items-center gap-3">
            <Avatar name={doctorName} size="md" />
            <h2 className="text-lg font-semibold text-gray-900">{doctorName}</h2>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            <SkeletonCard lines={5} />
            <SkeletonCard lines={5} />
          </div>
        ) : (
          <>
            <Calendar
              availableDates={availableDates}
              selectedDate={selectedDate}
              onSelect={setSelectedDate}
            />

            <AnimatePresence>
              {selectedDate && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <h3 className="font-medium text-gray-800 mb-2">
                    Время на{" "}
                    {new Date(selectedDate + "T12:00:00").toLocaleDateString("ru-RU", {
                      day: "numeric",
                      month: "long",
                    })}
                  </h3>
                  <TimeSlots
                    slots={daySlots}
                    selectedTime=""
                    onSelect={handleSlotSelect}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </PageTransition>
  );
}
