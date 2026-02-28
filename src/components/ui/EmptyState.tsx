import type { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({ icon: Icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <Icon className="w-12 h-12 text-gray-300 mb-4" strokeWidth={1.5} />
      <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 mb-4 max-w-[260px]">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="bg-primary-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 active:scale-[0.97] transition-all"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
