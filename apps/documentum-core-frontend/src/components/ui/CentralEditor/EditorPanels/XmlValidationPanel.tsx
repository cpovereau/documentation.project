import React from "react";
import type { XmlValidationResult } from "@/api/rubriques";

interface XmlValidationPanelProps {
  result: XmlValidationResult | null;
  validating: boolean;
  onClose: () => void;
}

const XmlValidationPanel: React.FC<XmlValidationPanelProps> = ({
  result,
  validating,
  onClose,
}) => {
  if (!validating && !result) return null;

  return (
    <div
      className={`mb-3 rounded-lg border px-4 py-3 text-sm ${
        validating
          ? "bg-blue-50 border-blue-200 text-blue-700"
          : result?.valid
          ? "bg-green-50 border-green-200 text-green-800"
          : "bg-red-50 border-red-200 text-red-800"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          {validating ? (
            <span className="animate-pulse">Validation en cours…</span>
          ) : result?.valid ? (
            <span className="font-semibold">XML bien formé.</span>
          ) : (
            <>
              <span className="font-semibold block mb-1">XML invalide :</span>
              <ul className="space-y-1 list-none">
                {result?.errors.map((err, i) => (
                  <li key={i} className="font-mono text-xs">
                    {err.line != null && (
                      <span className="text-red-600 font-semibold mr-1">
                        Ligne {err.line}{err.column != null ? `, col ${err.column}` : ""} —
                      </span>
                    )}
                    {err.message}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
        {!validating && (
          <button
            onClick={onClose}
            className="text-current opacity-50 hover:opacity-100 transition-opacity shrink-0"
            aria-label="Fermer"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export default XmlValidationPanel;
