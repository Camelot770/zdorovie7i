import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiGet } from "../api/client";
import { useApi } from "../hooks/useApi";
import { useBookingStore } from "../store/booking";
import Calendar from "../components/Calendar";
import TimeSlots from "../components/TimeSlots";
import type { Schedule, AppointmentSlot } from "../types";

export default function SlotsPage() {
  const navigate = useNavigate();
  const { doctorId } = useParams<{ doctorId: string }>();
  const { clinicId, specializationId, setAppointmentAt, doctorName } =
    useBookingStore();

  const [selectedDate, setSelectedDate] = useState("");

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
      const slots = s.appointmentSlots || [];
      for (const slot of slots) {
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
    setAppointmentAt(slot.startAt);
    navigate("/confirm");
  }

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-500">
        Загрузка расписания...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          {doctorName || "Выбор даты"}
        </h2>
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-primary-600"
        >
          Назад
        </button>
      </div>

      <Calendar
        availableDates={availableDates}
        selectedDate={selectedDate}
        onSelect={setSelectedDate}
      />

      {selectedDate && (
        <div>
          <h3 className="font-medium text-gray-800 mb-2">
            Время на{" "}
            {new Date(selectedDate).toLocaleDateString("ru-RU", {
              day: "numeric",
              month: "long",
            })}
          </h3>
          <TimeSlots
            slots={daySlots}
            selectedTime=""
            onSelect={handleSlotSelect}
          />
        </div>
      )}
    </div>
  );
}
