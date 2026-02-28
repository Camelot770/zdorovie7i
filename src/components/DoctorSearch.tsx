import { useState, useEffect, useRef } from "react";
import { apiGet } from "../api/client";
import type { Doctor } from "../types";

interface DoctorSearchProps {
  clinicId: string;
  specializationId: string;
  onSelect: (doctor: Doctor) => void;
}

export default function DoctorSearch({
  clinicId,
  specializationId,
  onSelect,
}: DoctorSearchProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Doctor[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      try {
        const params: Record<string, string> = { lastName: query };
        if (clinicId) params.clinicId = clinicId;
        if (specializationId) params.specializationId = specializationId;
        const data = await apiGet<Doctor[]>("/doctors", params);
        setSuggestions(Array.isArray(data) ? data : []);
        setShowDropdown(true);
      } catch {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timeoutRef.current);
  }, [query, clinicId, specializationId]);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Поиск по ФИО врача
      </label>
      <input
        type="text"
        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        placeholder="Введите фамилию"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
      />
      {showDropdown && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-lg max-h-60 overflow-auto">
          {suggestions.map((doc) => {
            const name = doc.name || [doc.lastName, doc.firstName, doc.middleName].filter(Boolean).join(" ");
            return (
              <li
                key={doc.id}
                className="px-3 py-2 hover:bg-primary-50 cursor-pointer text-sm"
                onMouseDown={() => {
                  onSelect(doc);
                  setQuery(name);
                  setShowDropdown(false);
                }}
              >
                {name}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
