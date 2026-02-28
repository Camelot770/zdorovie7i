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
    <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100 hover:shadow-card-hover transition-all duration-200">
      <div className="flex gap-3.5">
        <Avatar name={name} size="md" />
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[15px] text-gray-900 truncate">{name}</h3>
          {specializationName && (
            <div className="mt-1">
              <Badge variant="neutral">{specializationName}</Badge>
            </div>
          )}
          <div className="mt-2.5 space-y-1">
            {doctor.experience != null && (
              <p className="flex items-center gap-1.5 text-xs text-gray-500">
                <Briefcase className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                Стаж: {doctor.experience} лет
              </p>
            )}
            {clinicName && (
              <p className="flex items-center gap-1.5 text-xs text-gray-500">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                <span className="truncate">{clinicName}</span>
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
        className="mt-3.5 w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white py-2.5 rounded-xl text-sm font-semibold shadow-sm shadow-primary-600/20 hover:shadow-md active:scale-[0.97] transition-all duration-200"
        onClick={onBook}
      >
        Записаться
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
