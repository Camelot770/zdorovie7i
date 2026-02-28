import { useBookingStore } from "../store/booking";

export default function SuccessPage() {
  const { doctorName, clinicName, appointmentAt, reset } = useBookingStore();

  const dateStr = appointmentAt
    ? new Date(appointmentAt).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";
  const timeStr = appointmentAt ? appointmentAt.slice(11, 16) : "";

  function handleClose() {
    reset();
    if (window.WebApp?.close) {
      window.WebApp.close();
    }
  }

  return (
    <div className="text-center py-8 space-y-4">
      <div className="text-5xl">&#x2705;</div>
      <h2 className="text-xl font-semibold text-gray-900">
        Запись создана!
      </h2>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-left space-y-2 max-w-sm mx-auto">
        {doctorName && (
          <p className="text-sm">
            <span className="text-gray-500">Врач:</span> {doctorName}
          </p>
        )}
        {dateStr && (
          <p className="text-sm">
            <span className="text-gray-500">Дата:</span> {dateStr}, {timeStr}
          </p>
        )}
        {clinicName && (
          <p className="text-sm">
            <span className="text-gray-500">Филиал:</span> {clinicName}
          </p>
        )}
      </div>

      <p className="text-sm text-gray-500">
        Вам придёт напоминание за 24 часа и за 2 часа до приёма.
      </p>

      <button
        onClick={handleClose}
        className="w-full max-w-sm mx-auto bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
      >
        Вернуться в чат
      </button>
    </div>
  );
}
