import { useState, useEffect, useRef } from "react";
import { Search, Loader2, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { apiGet } from "../api/client";
import Avatar from "./ui/Avatar";
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
  const [searching, setSearching] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      setSearching(false);
      return;
    }

    setSearching(true);
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
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutRef.current);
  }, [query, clinicId, specializationId]);

  function getDoctorName(doc: Doctor) {
    return (
      doc.name ||
      [doc.lastName, doc.firstName, doc.middleName].filter(Boolean).join(" ")
    );
  }

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Поиск по ФИО врача
      </label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          className="w-full border border-gray-300 rounded-lg pl-9 pr-9 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          placeholder="Введите фамилию"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        />
        {searching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-600 animate-spin" />
        )}
        {!searching && query && (
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onMouseDown={(e) => {
              e.preventDefault();
              setQuery("");
              setSuggestions([]);
            }}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {showDropdown && query.length >= 2 && (
          <motion.ul
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-20 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-lg max-h-60 overflow-auto"
          >
            {suggestions.length === 0 ? (
              <li className="px-3 py-3 text-sm text-gray-500 text-center">
                Врачи не найдены
              </li>
            ) : (
              suggestions.map((doc) => {
                const name = getDoctorName(doc);
                return (
                  <li
                    key={doc.id}
                    className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-primary-50 cursor-pointer transition-colors"
                    onMouseDown={() => {
                      onSelect(doc);
                      setQuery(name);
                      setShowDropdown(false);
                    }}
                  >
                    <Avatar name={name} size="sm" />
                    <span className="text-sm text-gray-900">{name}</span>
                  </li>
                );
              })
            )}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
