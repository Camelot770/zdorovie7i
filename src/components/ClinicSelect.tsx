import type { Clinic } from "../types";

interface ClinicSelectProps {
  clinics: Clinic[];
  value: string;
  onChange: (id: string, name: string) => void;
  loading?: boolean;
}

export default function ClinicSelect({
  clinics,
  value,
  onChange,
  loading,
}: ClinicSelectProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Филиал
      </label>
      <select
        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        value={value}
        onChange={(e) => {
          const clinic = clinics.find((c) => c.id === e.target.value);
          onChange(e.target.value, clinic?.shortAddress || clinic?.name || "");
        }}
        disabled={loading}
      >
        <option value="">Все филиалы</option>
        {clinics.map((c) => (
          <option key={c.id} value={c.id}>
            {c.shortAddress || c.name}
          </option>
        ))}
      </select>
    </div>
  );
}
