import { useCallback, useState } from "react";

// API : openDialog(name), closeDialog(), isDialogOpen(name), toggleDialog(name), validateXml(), returnToEdit()

type DialogName = "find" | "history" | "xmlView" | "help";

export type UseEditorDialogsApi = {
  isDialogOpen: (name: DialogName) => boolean;
  openDialog: (name: DialogName) => void;
  closeDialog: () => void;
  toggleDialog: (name: DialogName) => void;
  validateXml: () => void;
  returnToEdit: () => void;
  lastXmlValidation: { ok: boolean; msg: string } | null;
};

const useEditorDialogs = (deps: {
  getXml: (id: number) => string | null;
  selectedMapItemId: number | null;
  toast: typeof import("sonner").toast;
}) => {
  // États internes
  const [openedDialog, setOpenedDialog] = useState<DialogName | null>(null);
  const [isXmlView, setIsXmlView] = useState(false);
  const [lastXmlValidation, setLastXmlValidation] = useState<null | { ok: boolean; msg: string }>(null);

  // API de gestion
  const isDialogOpen = useCallback((name: DialogName) => {
    if (name === "xmlView") return isXmlView;
    return openedDialog === name;
  }, [openedDialog, isXmlView]);

  const openDialog = useCallback((name: DialogName) => {
    if (name === "xmlView") setIsXmlView(true);
    else setOpenedDialog(name);
  }, []);

  const closeDialog = useCallback(() => {
    setOpenedDialog(null);
    setIsXmlView(false);
  }, []);

  const toggleDialog = useCallback((name: DialogName) => {
    if (isDialogOpen(name)) closeDialog();
    else openDialog(name);
  }, [isDialogOpen, closeDialog, openDialog]);

  // Validation XML
  const validateXml = useCallback(() => {
    const { getXml, selectedMapItemId, toast } = deps;
    if (!selectedMapItemId) return;
    const xmlString = getXml(selectedMapItemId);
    if (!xmlString || typeof xmlString !== "string" || xmlString.trim() === "") {
      toast.error("Aucun contenu XML à valider.");
      return;
    }
    let valid = false;
    let msg = "";
    try {
      const parser = new window.DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, "application/xml");
      const parserErrors = xmlDoc.getElementsByTagName("parsererror");
      if (parserErrors && parserErrors.length > 0) {
        valid = false;
        msg = "❌ XML non valide : " + parserErrors[0].textContent;
      } else {
        valid = true;
        msg = "✅ XML bien formé !";
      }
    } catch (e) {
      valid = false;
      msg = "❌ Erreur lors de la validation XML : " + (e as Error).message;
    }
    setIsXmlView(true);
    setLastXmlValidation({ ok: valid, msg });
    setTimeout(() => alert(msg), 100);
  }, [deps]);

  // Retour à l’édition
  const returnToEdit = useCallback(() => {
    setIsXmlView(false);
  }, []);

  return {
    isDialogOpen,
    openDialog,
    closeDialog,
    toggleDialog,
    validateXml,
    returnToEdit,
    lastXmlValidation,
  } satisfies UseEditorDialogsApi;
};

export default useEditorDialogs;
