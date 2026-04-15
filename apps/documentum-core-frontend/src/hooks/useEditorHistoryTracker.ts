// hooks/useEditorHistoryTracker.ts
import { useState } from "react";

export interface HistoryEntry {
  action: string;
  ts: number;
  content?: string;
}

export function useEditorHistoryTracker() {
  const [historyLog, setHistoryLog] = useState<HistoryEntry[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const logAction = (action: string, content?: string) => {
    setHistoryLog((logs) => [...logs, { action, ts: Date.now(), content }]);
  };

  const clearHistory = () => {
    setHistoryLog([]);
  };

  return {
    historyLog,
    isHistoryOpen,
    setIsHistoryOpen,
    logAction,
    clearHistory,
  };
}
