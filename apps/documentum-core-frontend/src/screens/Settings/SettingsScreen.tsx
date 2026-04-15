import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  ShieldCheck,
  LayoutDashboard,
  FileCode,
  BadgePercent,
  ClipboardList,
  Settings2,
  RefreshCcw,
} from "lucide-react";
import AccessTab from "./tabs/AccessTab";
import DataTab from "./tabs/DataTab";
import FormatTab from "./tabs/FormatTab";
import NamingTab from "./tabs/NamingTab";
import LogsTab from "./tabs/LogsTab";
import TechTab from "./tabs/TechTab";
import MaintenanceTab from "./tabs/MaintenanceTab";

const tabs = [
  { id: "access", label: "Accès", icon: ShieldCheck },
  { id: "data", label: "Données", icon: LayoutDashboard },
  { id: "formats", label: "DITA / XML", icon: FileCode },
  { id: "naming", label: "Nomenclature", icon: BadgePercent },
  { id: "logs", label: "Journalisation", icon: ClipboardList },
  { id: "tech", label: "Paramètres", icon: Settings2 },
  { id: "maintenance", label: "Maintenance", icon: RefreshCcw },
];

export default function SettingsScreen() {
  const [activeTab, setActiveTab] = useState("access");

  return (
    <div className="flex h-full w-full">
      {/* Sidebar */}
      <div className="w-1/5 max-w-xs bg-orange-400 text-white p-4 space-y-2">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              "w-full flex items-center px-3 py-2 rounded-xl transition-all hover:bg-orange-500",
              activeTab === id && "bg-black/20 text-white font-semibold"
            )}
          >
            <Icon className="w-5 h-5 mr-2" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-grow bg-white overflow-auto transition-all duration-300 ease-in-out">
        {activeTab === "access" && <AccessTab />}
        {activeTab === "data" && <DataTab />}
        {activeTab === "formats" && <FormatTab />}
        {activeTab === "naming" && <NamingTab />}
        {activeTab === "logs" && <LogsTab />}
        {activeTab === "tech" && <TechTab />}
        {activeTab === "maintenance" && <MaintenanceTab />}
      </div>
    </div>
  );
}
