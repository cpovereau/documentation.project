import type { PopupProps as OriginalPopupProps } from "@/types/PopupSuggestion";

type PopupProps = Readonly<OriginalPopupProps>;

export default function PopupSuggestion({
  x,
  y,
  suggestions,
  message,
  from,
  to,
  onReplace,
}: PopupProps) {
  return (
    <div
      className="absolute z-50 bg-white shadow-xl p-2 rounded border"
      style={{ top: y + 10, left: x + 10 }}
    >
      <div className="text-sm text-gray-600 mb-2">{message}</div>
      {suggestions.map((s, i) => (
        <button
          key={i}
          className="text-blue-600 hover:underline block"
          onClick={() => onReplace(s, from, to)}
        >
          {s}
        </button>
      ))}
    </div>
  );
}
