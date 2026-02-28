import type { AppointmentSlot } from "../types";

interface TimeSlotsProps {
  slots: AppointmentSlot[];
  selectedTime: string;
  onSelect: (slot: AppointmentSlot) => void;
}

export default function TimeSlots({
  slots,
  selectedTime,
  onSelect,
}: TimeSlotsProps) {
  const available = slots.filter((s) => s.isEmpty);

  if (available.length === 0) {
    return (
      <p className="text-sm text-gray-500 text-center py-4">
        Нет доступных слотов на выбранную дату
      </p>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-2">
      {available.map((slot) => {
        const time = slot.startAt.slice(11, 16);
        const isSelected = slot.startAt === selectedTime;

        return (
          <button
            key={slot.startAt}
            onClick={() => onSelect(slot)}
            className={`py-2 rounded-lg text-sm font-medium transition-colors ${
              isSelected
                ? "bg-primary-600 text-white"
                : "bg-white border border-gray-200 text-gray-700 hover:border-primary-400 hover:bg-primary-50"
            }`}
          >
            {time}
          </button>
        );
      })}
    </div>
  );
}
