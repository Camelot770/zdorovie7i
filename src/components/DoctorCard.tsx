import type { Doctor } from "../types";

interface DoctorCardProps {
  doctor: Doctor;
  specializationName?: string;
  clinicName?: string;
  nearestDate?: string;
  onBook: () => void;
}

export default function DoctorCard({
  doctor,
  specializationName,
  clinicName,
  nearestDate,
  onBook,
}: DoctorCardProps) {
  const name =
    doctor.name ||
    [doctor.lastName, doctor.firstName, doctor.middleName]
      .filter(Boolean)
      .join(" ");

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{name}</h3>
          {specializationName && (
            <p className="text-sm text-primary-600 mt-0.5">{specializationName}</p>
          )}
          {doctor.experience != null && (
            <p className="text-xs text-gray-500 mt-1">
              Стаж: {doctor.experience} лет
            </p>
          )}
          {clinicName && (
            <p className="text-xs text-gray-500">{clinicName}</p>
          )}
          {nearestDate && (
            <p className="text-xs text-green-600 mt-1">
              Ближайшая запись: {nearestDate}
            </p>
          )}
        </div>
      </div>
      <button
        className="mt-3 w-full bg-primary-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
        onClick={onBook}
      >
        Записаться
      </button>
    </div>
  );
}
