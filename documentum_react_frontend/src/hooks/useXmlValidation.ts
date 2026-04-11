import { useState, useCallback } from "react";
import { validateXml, type XmlValidationResult } from "@/api/rubriques";

export type UseXmlValidationApi = {
  validating: boolean;
  result: XmlValidationResult | null;
  runValidation: (xml: string) => Promise<void>;
  clearResult: () => void;
};

export function useXmlValidation(): UseXmlValidationApi {
  const [validating, setValidating] = useState(false);
  const [result, setResult] = useState<XmlValidationResult | null>(null);

  const runValidation = useCallback(async (xml: string) => {
    setValidating(true);
    try {
      const res = await validateXml(xml);
      setResult(res);
    } catch {
      setResult({
        valid: false,
        errors: [{ message: "Erreur réseau lors de la validation." }],
      });
    } finally {
      setValidating(false);
    }
  }, []);

  const clearResult = useCallback(() => setResult(null), []);

  return { validating, result, runValidation, clearResult };
}
