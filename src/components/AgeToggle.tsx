interface AgeToggleProps {
  isChild: boolean;
  onChange: (isChild: boolean) => void;
}

export default function AgeToggle({ isChild, onChange }: AgeToggleProps) {
  return (
    <div className="flex rounded-lg overflow-hidden border border-gray-300">
      <button
        className={`flex-1 py-2 text-sm font-medium transition-colors ${
          !isChild
            ? "bg-primary-600 text-white"
            : "bg-white text-gray-700 hover:bg-gray-50"
        }`}
        onClick={() => onChange(false)}
      >
        Взрослый
      </button>
      <button
        className={`flex-1 py-2 text-sm font-medium transition-colors ${
          isChild
            ? "bg-primary-600 text-white"
            : "bg-white text-gray-700 hover:bg-gray-50"
        }`}
        onClick={() => onChange(true)}
      >
        Ребёнок
      </button>
    </div>
  );
}
