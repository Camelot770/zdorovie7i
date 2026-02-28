import type { Record } from "../types";

interface RecordCardProps {
  record: Record;
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
  const dateStr = appt ? new Date(appt).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }) : "—";
  const timeStr = appt ? appt.slice(11, 16) : "";

  const statusText = record.status || "—";
  const statusColor = record.confirmed
    ? "text-green-600"
    : record.canceled
      ? "text-red-500"
      : "text-yellow-600";

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-semibold text-gray-900">
            {dateStr}, {timeStr}
          </p>
          {doctorName && (
            <p className="text-sm text-gray-700 mt-0.5">{doctorName}</p>
          )}
          {clinicName && (
            <p className="text-xs text-gray-500">{clinicName}</p>
          )}
        </div>
        <span className={`text-xs font-medium ${statusColor}`}>
          {statusText}
        </span>
      </div>
      {onCancel && record.status === "Запланирована" && (
        <button
          onClick={onCancel}
          className="mt-2 w-full border border-red-300 text-red-600 py-1.5 rounded-lg text-sm hover:bg-red-50 transition-colors"
        >
          Отменить запись
        </button>
      )}
    </div>
  );
}
