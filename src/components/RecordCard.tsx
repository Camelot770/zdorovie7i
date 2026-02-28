import { Calendar, User, Building2, X } from "lucide-react";
import Badge from "./ui/Badge";
import type { Appointment } from "../types";

interface RecordCardProps {
  record: Appointment;
  clinicName?: string;
  doctorName?: string;
  onCancel?: () => void;
}

export default function RecordCard({
  record,
  clinicName,
  doctorName,
  onCancel,
}: RecordCardProps) {
  const appt = record.appointmentAt || "";
  const dateStr = appt
    ? new Date(appt).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";
  const timeStr = appt ? appt.slice(11, 16) : "";

  const statusVariant = record.confirmed
    ? "success"
    : record.canceled
      ? "danger"
      : "warning";
  const statusText = record.confirmed
    ? "Подтверждена"
    : record.canceled
      ? "Отменена"
      : record.status || "Запланирована";

  return (
    <div className="bg-white rounded-xl p-4 shadow-card border border-gray-100">
      <div className="flex justify-between items-start mb-3">
        <div className="space-y-1.5">
          <p className="flex items-center gap-1.5 font-semibold text-gray-900">
            <Calendar className="w-4 h-4 text-primary-600 flex-shrink-0" />
            {dateStr}, {timeStr}
          </p>
          {doctorName && (
            <p className="flex items-center gap-1.5 text-sm text-gray-700">
              <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              {doctorName}
            </p>
          )}
          {clinicName && (
            <p className="flex items-center gap-1.5 text-xs text-gray-500">
              <Building2 className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              {clinicName}
            </p>
          )}
        </div>
        <Badge variant={statusVariant}>{statusText}</Badge>
      </div>
      {onCancel && record.status === "Запланирована" && (
        <button
          onClick={onCancel}
          className="w-full flex items-center justify-center gap-1.5 border border-danger-500 text-danger-600 py-2 rounded-lg text-sm font-medium hover:bg-danger-50 active:scale-[0.98] transition-all"
        >
          <X className="w-4 h-4" />
          Отменить запись
        </button>
      )}
    </div>
  );
}
