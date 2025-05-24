import { toast } from 'react-toastify';

/**
 * Affiche une notification utilisateur.
 * @param {string} message - Le message à afficher.
 * @param {string} type - Le type de notification ("success", "error", "info", "warning").
 */
export const notify = (message, type = "success") => {
  toast(message, {
    type, // Type de notification : success, error, info, warning
    position: "top-right",
    autoClose: 2000, // Délai avant fermeture (en ms)
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  });
};