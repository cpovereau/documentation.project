import React from "react";
import { cn } from "lib/utils";
import { Button } from "components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "components/ui/switch";
import { Archive, Undo2 } from "lucide-react";

interface DataListPanelProps {
  title: string;
  items: any[];
  columns: { key: string; label: string }[];
  onAdd: () => void;
  onArchive: (id: number) => void;
  archived: boolean;
  onToggleArchived: (value: boolean) => void;
}

const ACTION_KEY = "action";

const DataListPanel: React.FC<DataListPanelProps> = ({
  title,
  items,
  columns,
  onAdd,
  onArchive,
  archived,
  onToggleArchived,
}) => {
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <label
            htmlFor="toggle-archived"
            className="text-sm text-muted-foreground"
          >
            Afficher archivés
          </label>
          <Switch
            id="toggle-archived"
            checked={archived}
            onCheckedChange={onToggleArchived}
          />
        </div>
      </div>

      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={cn(
                    "text-xs font-semibold uppercase text-muted-foreground tracking-wider",
                    col.key === ACTION_KEY ? "text-right" : "text-left"
                  )}
                >
                  {col.label}
                </TableHead>
              ))}
              <TableHead className="text-center text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow
                key={item.id}
                className={item.is_archived ? "opacity-50 italic" : ""}
              >
                {columns.map((col) => (
                  <TableCell key={col.key}>{item[col.key]}</TableCell>
                ))}
                <TableCell className="text-center">
                  {archived ? (
                    <Button
                      variant="ghost"
                      onClick={() => onArchive(item.id)}
                      title={`Restaurer ${title.toLowerCase().slice(0, -1)}`}
                    >
                      <Undo2 className="w-4 h-4" />
                    </Button>
                  ) : (
                    !item.is_archived && (
                      <Button
                        variant="ghost"
                        onClick={() => onArchive(item.id)}
                        title={`Archiver ${title.toLowerCase().slice(0, -1)}`}
                      >
                        <Archive className="w-4 h-4" />
                      </Button>
                    )
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DataListPanel;
