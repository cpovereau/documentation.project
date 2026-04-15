import { useCallback, useState } from "react";

// API : openDialog(name), closeDialog(), isDialogOpen(name), toggleDialog(name), openXmlView(), returnToEdit()

type DialogName = "find" | "history" | "xmlView" | "help";

export type UseEditorDialogsApi = {
  isDialogOpen: (name: DialogName) => boolean;
  openDialog: (name: DialogName) => void;
  closeDialog: () => void;
  toggleDialog: (name: DialogName) => void;
  openXmlView: () => void;
  returnToEdit: () => void;
};

const useEditorDialogs = () => {
  // États internes
  const [openedDialog, setOpenedDialog] = useState<DialogName | null>(null);
  const [isXmlView, setIsXmlView] = useState(false);

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

  // Ouverture vue XML (validation gérée dans CentralEditor)
  const openXmlView = useCallback(() => {
    setIsXmlView(true);
  }, []);

  // Retour à l’édition
  const returnToEdit = useCallback(() => {
    setIsXmlView(false);
  }, []);

  return {
    isDialogOpen,
    openDialog,
    closeDialog,
    toggleDialog,
    openXmlView,
    returnToEdit,
  } satisfies UseEditorDialogsApi;
};

export default useEditorDialogs;
