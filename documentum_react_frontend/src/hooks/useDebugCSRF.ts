import { useEffect, useState } from "react";
import axios from "axios";

export function useDebugCSRF() {
  const [cookieToken, setCookieToken] = useState<string | null>(null);
  const [headerToken, setHeaderToken] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const getCookie = (name: string): string | null => {
      const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
      return match ? match[2] : null;
    };

    setCookieToken(getCookie("csrftoken"));
    setSessionId(getCookie("sessionid"));

    // ⛔️ FAUX : ce header ne passe que si l’intercepteur est déclenché
    const requestId = axios.interceptors.request.use((config) => {
      const x = (config.headers as any)["X-CSRFToken"];
      if (x) setHeaderToken(x);

      // ✅ Affiche tous les headers envoyés
      console.log("📤 Axios headers envoyés :", config.headers);

      // Ejecte pour ne pas le réexécuter à chaque requête
      axios.interceptors.request.eject(requestId);
      return config;
    });

    // Déclenche une requête bidon pour que l’intercepteur se déclenche
    const testForm = new FormData();
    testForm.append("debug", "1");

    axios
      .post("/csrf/", testForm, {
        baseURL: import.meta.env.VITE_API_BASE_URL,
        withCredentials: true,
      })
      .catch(() => {}); // on ignore l’erreur volontaire

  }, []);

  return { cookieToken, headerToken, sessionId };
}
