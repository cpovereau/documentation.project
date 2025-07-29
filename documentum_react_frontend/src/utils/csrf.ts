import { api } from "@/lib/apiClient";

export async function ensureCSRFReady(timeout = 1000): Promise<void> {
  await api.get("/csrf/");

  const start = Date.now();
  while (!document.cookie.includes("csrftoken=")) {
    if (Date.now() - start > timeout) {
      throw new Error("⛔ CSRF token non présent après " + timeout + "ms");
    }
    await new Promise((r) => setTimeout(r, 50));
  }
}
