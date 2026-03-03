import { useState } from "react";
import { ChevronDown, Stethoscope, Users } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import type { Specialization, Service } from "../types";

interface Props {
  specializations: Specialization[];
  servicesBySpec: Record<string, Service[]>;
  onSelect: (specId: string, specName: string) => void;
  loading?: boolean;
}

export default function SpecializationAccordion({
  specializations,
  servicesBySpec,
  onSelect,
  loading = false,
}: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Only show specializations that have services
  const visible = specializations.filter((s) => servicesBySpec[s.id]?.length);

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (visible.length === 0) {
    return (
      <div className="text-center text-gray-500 text-sm py-6">
        Нет доступных специальностей
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Специальность
      </label>
      {visible.map((spec) => {
        const isOpen = expandedId === spec.id;
        const services = servicesBySpec[spec.id] || [];
        const minPrice = services[0]?.price;

        return (
          <div
            key={spec.id}
            className="bg-white rounded-xl border border-gray-100 shadow-card overflow-hidden"
          >
            {/* Header */}
            <button
              type="button"
              onClick={() => setExpandedId(isOpen ? null : spec.id)}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                <Stethoscope className="w-4 h-4 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="block text-sm font-medium text-gray-900 truncate">
                  {spec.name}
                </span>
                {!isOpen && minPrice != null && (
                  <span className="block text-xs text-gray-500 mt-0.5">
                    от {minPrice.toLocaleString("ru-RU")} ₽
                  </span>
                )}
              </div>
              <ChevronDown
                className={clsx(
                  "w-4 h-4 text-gray-400 transition-transform flex-shrink-0",
                  isOpen && "rotate-180"
                )}
              />
            </button>

            {/* Expandable services list */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-3">
                    <div className="border-t border-gray-100 pt-2">
                      {services.map((svc, idx) => (
                        <div
                          key={svc.id}
                          className={clsx(
                            "flex items-center justify-between py-2.5",
                            idx < services.length - 1 && "border-b border-gray-50"
                          )}
                        >
                          <span className="text-sm text-gray-700 pr-3 leading-snug">
                            {svc.name}
                          </span>
                          <span className="text-sm font-semibold text-gray-900 whitespace-nowrap flex-shrink-0">
                            {svc.price?.toLocaleString("ru-RU")} ₽
                          </span>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelect(spec.id, spec.name)}
                      className="w-full mt-3 flex items-center justify-center gap-2 bg-primary-50 hover:bg-primary-100 text-primary-700 py-2.5 rounded-lg font-medium text-sm transition-colors"
                    >
                      <Users className="w-4 h-4" />
                      Показать врачей
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
