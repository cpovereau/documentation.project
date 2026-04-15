import { useImportModal } from "@/hooks/useImportModal";
import { ImportModal } from "@/components/ui/import-modal";

export default function GlobalImportModal() {
  const {
    open,
    context,
    produits,
    fonctionnalites,
    interfaces,
    onConfirm,
    onClose,
    closeImportModal,
    title,
  } = useImportModal();

  return (
    <ImportModal
      open={open}
      context={context}
      produits={produits}
      fonctionnalites={fonctionnalites}
      interfaces={interfaces}
      title={title}
      onClose={() => {
        closeImportModal();
        onClose?.();
      }}
      onConfirm={(params) => {
        onConfirm(params);
        closeImportModal();
      }}
    />
  );
}
