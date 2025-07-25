import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { Button } from "./button";

interface Props {
  open: boolean;
  onClose: () => void;
}

const SessionExpiredModal: React.FC<Props> = ({ open, onClose }) => {
  useEffect(() => {
    if (open) {
      console.warn("Session expirée détectée");
    }
  }, [open]);

  const handleReconnect = () => {
    onClose(); // Optionnel
    window.location.href = "/login";
  };

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-red-600">Session expirée</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Votre session a expiré. Veuillez vous reconnecter pour continuer.
        </p>
        <DialogFooter>
          <Button onClick={handleReconnect}>Reconnexion</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SessionExpiredModal;
