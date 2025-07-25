import React, { useState } from "react";
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
  onArchive: (id: number, isArchived: boolean) => void;
  archived: boolean;
  onToggleArchived: (value: boolean) => void;
  editable?: boolean;
  onUpdate?: (id: number, changes: Record<string, string>) => void;
}

const ACTION_KEY = "action";

const isEditableColumn = (label: string) =>
  ["NOM", "DESCRIPTION", "CODE"].includes(label.toUpperCase());

const InlineEditableCell = ({
  value,
  onSave,
}: {
  value: string;
  onSave: (val: string) => void;
}) => {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value || "");

  return editing ? (
    <input
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={() => {
        setEditing(false);
        if (val !== value) onSave(val);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          setEditing(false);
          if (val !== value) onSave(val);
        }
        if (e.key === "Escape") {
          setVal(value);
          setEditing(false);
        }
      }}
      className="border p-1 w-full rounded text-sm"
      autoFocus
    />
  ) : (
    <span
      onDoubleClick={() => setEditing(true)}
      className={cn(
        "cursor-pointer hover:underline",
        !value?.trim() && "italic text-muted-foreground"
      )}
    >
      {value?.trim() || "✏️ Ajouter..."}
    </span>
  );
};

const DataListPanel: React.FC<DataListPanelProps> = ({
  title,
  items,
  columns,
  onAdd,
  onArchive,
  archived,
  onToggleArchived,
  editable = false,
  onUpdate,
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
            {!items || items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  className="text-center text-muted-foreground italic"
                >
                  Aucun élément à afficher.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow
                  key={item.id}
                  className={item.is_archived ? "opacity-50 italic" : ""}
                >
                  {columns.map((col) => (
                    <TableCell key={col.key}>
                      {editable && isEditableColumn(col.label) && onUpdate ? (
                        <InlineEditableCell
                          value={item[col.key] ?? ""}
                          onSave={(val) =>
                            onUpdate(item.id, { [col.key]: val })
                          }
                        />
                      ) : (
                        item[col.key]
                      )}
                    </TableCell>
                  ))}
                  <TableCell className="text-center">
                    {archived ? (
                      <Button
                        variant="ghost"
                        onClick={() => onArchive(item.id, item.is_archived)}
                        title={`Restaurer ${title.toLowerCase().slice(0, -1)}`}
                      >
                        <Undo2 className="w-4 h-4" />
                      </Button>
                    ) : (
                      !item.is_archived && (
                        <Button
                          variant="ghost"
                          onClick={() => onArchive(item.id, item.is_archived)}
                          title={`Archiver ${title.toLowerCase().slice(0, -1)}`}
                        >
                          <Archive className="w-4 h-4" />
                        </Button>
                      )
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DataListPanel;
