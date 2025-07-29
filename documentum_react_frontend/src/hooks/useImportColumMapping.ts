import { useEffect, useState } from "react";
import Papa from "papaparse";

export interface FieldConfig {
  [key: string]: {
    label: string;
    required?: boolean;
  };
}

interface UseImportColumnMappingResult {
  rawData: string[][];
  colMap: Record<string, number>;
  setColMap: (map: Record<string, number>) => void;
  ignoreHeader: boolean;
  setIgnoreHeader: (v: boolean) => void;
  isValid: () => boolean;
  columnCount: number;
}

export function useImportColumnMapping(
  file: File,
  fieldConfig: FieldConfig
): UseImportColumnMappingResult {
  const [rawData, setRawData] = useState<string[][]>([]);
  const [colMap, setColMap] = useState<Record<string, number>>({});
  const [ignoreHeader, setIgnoreHeader] = useState<boolean>(true);

  useEffect(() => {
    if (!file) return;

    Papa.parse(file, {
      complete: (result) => {
        const cleaned = (result.data as string[][]).filter(
          (row) => row.join("").trim() !== ""
        );
        setRawData(cleaned);
      },
      error: () => {
        console.error("Erreur lors du parsing du fichier CSV");
        setRawData([]);
      },
    });
  }, [file]);

  const isValid = () => {
    return Object.entries(fieldConfig).every(([key, config]) => {
      return !config.required || colMap[key] != null;
    });
  };

  const columnCount = rawData[0]?.length || 0;

  return {
    rawData,
    colMap,
    setColMap,
    ignoreHeader,
    setIgnoreHeader,
    isValid,
    columnCount,
  };
}
