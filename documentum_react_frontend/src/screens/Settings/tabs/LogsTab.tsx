import { useState } from "react";
import { Button } from "components/ui/button";
import LogTable from "../components/LogTable";
import { logsMockData } from "./mockLogs";
import { LogEntry, LogType } from "types/LogsTypes";

const FILTERS: { label: string; value: LogType | "all" }[] = [
  { label: "Tous", value: "all" },
  { label: "Modifications", value: "modification" },
  { label: "Exports", value: "export" },
  { label: "Connexions", value: "login" },
  { label: "Actions utilisateur", value: "audit" },
];

export default function LogsTab() {
  const [activeFilter, setActiveFilter] = useState<"all" | LogType>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const resetFilters = () => {
    setActiveFilter("all");
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
  };

  const filteredLogs = logsMockData.filter((log) => {
    const logDate = new Date(log.date);
    const matchFilter = activeFilter === "all" || log.type === activeFilter;
    const matchSearch =
      log.utilisateur.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.description?.toLowerCase().includes(searchTerm.toLowerCase()) ??
        false) ||
      (log.projet?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchStart = startDate
      ? logDate >= new Date(new Date(startDate).setHours(0, 0, 0, 0))
      : true;
    const matchEnd = endDate
      ? logDate <= new Date(new Date(endDate).setHours(23, 59, 59, 999))
      : true;
    return matchFilter && matchSearch && matchStart && matchEnd;
  });

  return (
    <div className="flex h-full">
      {/* Colonne latérale gauche */}
      <div className="w-64 bg-orange-100 p-4 border-r border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Filtres</h2>
        <div className="space-y-2">
          {FILTERS.map((filter) => (
            <Button
              key={filter.value}
              variant={activeFilter === filter.value ? "default" : "ghost"}
              className="w-full text-left justify-start px-3 py-2 rounded font-medium text-sm"
              onClick={() => setActiveFilter(filter.value)}
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Zone principale */}
      <div className="flex-1 p-6 overflow-auto">
        <h1 className="text-xl font-bold mb-4">Historique des actions</h1>

        {/* Barre de recherche + filtres date */}
        <div className="mb-4 flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0">
          <input
            type="text"
            placeholder="Rechercher dans les logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/3 p-2 border border-gray-300 rounded-md"
          />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="p-2 border border-gray-300 rounded-md"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="p-2 border border-gray-300 rounded-md"
          />
          <Button
            variant="outline"
            className="text-sm h-10 px-4"
            onClick={resetFilters}
          >
            Réinitialiser
          </Button>
        </div>

        <LogTable logs={filteredLogs} />
      </div>
    </div>
  );
}
