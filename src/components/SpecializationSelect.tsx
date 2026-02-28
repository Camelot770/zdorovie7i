import type { Specialization } from "../types";

interface SpecializationSelectProps {
  specializations: Specialization[];
  value: string;
  onChange: (id: string, name: string) => void;
  loading?: boolean;
}

export default function SpecializationSelect({
  specializations,
  value,
  onChange,
  loading,
}: SpecializationSelectProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Специальность
      </label>
      <select
        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        value={value}
        onChange={(e) => {
          const spec = specializations.find((s) => s.id === e.target.value);
          onChange(e.target.value, spec?.name || "");
        }}
        disabled={loading}
      >
        <option value="">Все специальности</option>
        {specializations.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
    </div>
  );
}
