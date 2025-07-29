import { useState } from "react";
import { toast } from "sonner";
import { ImportModal } from "@/components/ui";

interface UseImportManagerOptions {
  title: string;
  accept?: string;
  onUpload: (file: File) => Promise<void>;
}

export function useImportManager({ title, accept = "*", onUpload }: UseImportManagerOptions) {
  const [open, setOpen] = useState(false);

  const start = () => setOpen(true);
  const close = () => setOpen(false);

  const ImportUI = () => (
    <ImportModal
      open={open}
      title={title}
      accept={accept}
      onClose={close}
      onNext={async (file) => {
        if (!file) return;
        try {
          await onUpload(file);
          toast.success("Import terminé !");
        } catch (err: any) {
          toast.error(err?.response?.data?.error || "Erreur lors de l'import");
          console.error(err);
        } finally {
          close();
        }
      }}
    />
  );

  return { ImportUI, start };
}
