import { LogEntry } from "@/types/LogsTypes";

interface LogTableProps {
  logs: LogEntry[];
}

export default function LogTable({ logs }: Readonly<LogTableProps>) {
  return (
    <div className="overflow-x-auto rounded border">
      <table className="min-w-[950px] table-auto text-sm text-left">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 whitespace-nowrap">Date</th>
            <th className="px-4 py-2">Utilisateur</th>
            <th className="px-4 py-2">Action</th>
            <th className="px-4 py-2">Cible</th>
            <th className="px-4 py-2">Description</th>
            <th className="px-4 py-2">Projet</th>
            <th className="px-4 py-2">Map</th>
            <th className="px-4 py-2">Format</th>
          </tr>
        </thead>
        <tbody>
          {logs.length === 0 ? (
            <tr>
              <td colSpan={8} className="text-center py-4 text-gray-500">
                Aucun log à afficher.
              </td>
            </tr>
          ) : (
            logs.map((log) => (
              <tr key={log.id} className="border hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap">
                  {new Date(log.date).toLocaleDateString()}
                  <br />
                  <span className="text-gray-500 text-xs">
                    {new Date(log.date).toLocaleTimeString()}
                  </span>
                </td>
                <td className="px-4 py-2">{log.utilisateur}</td>
                <td className="px-4 py-2">{log.action}</td>
                <td className="px-4 py-2">{log.cible || "-"}</td>
                <td className="px-4 py-2">{log.description || "-"}</td>
                <td className="px-4 py-2">{log.projet || "-"}</td>
                <td className="px-4 py-2">{log.map || "-"}</td>
                <td className="px-4 py-2">{log.format || "-"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
