import { Briefcase, MapPin, Calendar, ArrowRight } from "lucide-react";
import Avatar from "./ui/Avatar";
import Badge from "./ui/Badge";
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
    <div className="bg-white rounded-xl p-4 shadow-card border border-gray-100 hover:shadow-card-hover transition-shadow">
      <div className="flex gap-3">
        <Avatar name={name} size="md" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{name}</h3>
          {specializationName && (
            <div className="mt-1">
              <Badge variant="neutral">{specializationName}</Badge>
            </div>
          )}
          <div className="mt-2 space-y-0.5">
            {doctor.experience != null && (
              <p className="flex items-center gap-1.5 text-xs text-gray-500">
                <Briefcase className="w-3.5 h-3.5 flex-shrink-0" />
                Стаж: {doctor.experience} лет
              </p>
            )}
            {clinicName && (
              <p className="flex items-center gap-1.5 text-xs text-gray-500">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                {clinicName}
              </p>
            )}
            {nearestDate && (
              <p className="flex items-center gap-1.5 text-xs text-success-600 font-medium">
                <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                Ближайшая: {nearestDate}
              </p>
            )}
          </div>
        </div>
      </div>
      <button
        className="mt-3 w-full flex items-center justify-center gap-1.5 bg-primary-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 active:scale-[0.98] transition-all"
        onClick={onBook}
      >
        Записаться
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
