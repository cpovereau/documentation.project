import { useImportModal } from "@/hooks/useImportModal";
import { ImportModal } from "@/components/ui/import-modal";

export default function GlobalImportModal() {
  const { open, context, produits, onConfirm, onClose, closeImportModal } =
    useImportModal();

  return (
    <ImportModal
      open={open}
      context={context}
      produits={produits}
      onClose={() => {
        closeImportModal();
        onClose?.();
      }}
      onConfirm={(params) => {
        onConfirm(params);
        closeImportModal();
      }}
      title="Importer des données"
    />
  );
}
