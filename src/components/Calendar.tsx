import { useMemo } from "react";
import clsx from "clsx";

interface CalendarProps {
  availableDates: Set<string>;
  selectedDate: string;
  onSelect: (date: string) => void;
}

export default function Calendar({
  availableDates,
  selectedDate,
  onSelect,
}: CalendarProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const months = useMemo(() => {
    const result: { year: number; month: number; days: Date[] }[] = [];
    for (let m = 0; m < 2; m++) {
      const d = new Date(today.getFullYear(), today.getMonth() + m, 1);
      const year = d.getFullYear();
      const month = d.getMonth();
      const days: Date[] = [];
      const first = new Date(year, month, 1);
      const last = new Date(year, month + 1, 0);

      const startPad = (first.getDay() + 6) % 7;
      for (let i = 0; i < startPad; i++) {
        days.push(new Date(year, month, 1 - startPad + i));
      }

      for (let day = 1; day <= last.getDate(); day++) {
        days.push(new Date(year, month, day));
      }

      result.push({ year, month, days });
    }
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
  const monthNames = [
    "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
  ];

  function formatDate(d: Date): string {
    return d.toISOString().split("T")[0];
  }

  const todayStr = formatDate(today);

  return (
    <div className="space-y-5">
      {months.map(({ year, month, days }) => (
        <div key={`${year}-${month}`} className="bg-white rounded-xl p-3 shadow-card border border-gray-100">
          <h3 className="text-center font-semibold text-gray-800 mb-3">
            {monthNames[month]} {year}
          </h3>
          <div className="grid grid-cols-7 gap-1 text-center">
            {weekDays.map((wd) => (
              <div key={wd} className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold py-1">
                {wd}
              </div>
            ))}
            {days.map((day, i) => {
              const ds = formatDate(day);
              const isCurrentMonth = day.getMonth() === month;
              const isPast = day < today;
              const isAvailable = availableDates.has(ds) && !isPast;
              const isSelected = ds === selectedDate;
              const isToday = ds === todayStr;

              return (
                <button
                  key={i}
                  disabled={!isAvailable}
                  onClick={() => isAvailable && onSelect(ds)}
                  className={clsx(
                    "relative min-h-[40px] rounded-lg text-sm transition-all flex flex-col items-center justify-center",
                    !isCurrentMonth && "text-gray-200",
                    isCurrentMonth && isSelected && "bg-primary-600 text-white font-bold shadow-sm",
                    isCurrentMonth && !isSelected && isAvailable && "bg-primary-50 text-primary-700 hover:bg-primary-100 font-medium active:scale-90",
                    isCurrentMonth && !isSelected && !isAvailable && isPast && "text-gray-300",
                    isCurrentMonth && !isSelected && !isAvailable && !isPast && "text-gray-400",
                    isToday && !isSelected && "ring-1 ring-primary-300"
                  )}
                >
                  {day.getDate()}
                  {isAvailable && !isSelected && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary-500" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
