import React from "react";
import { useDebugCSRF } from "@/hooks/useDebugCSRF";

export function DebugCSRF() {
  const { cookieToken, headerToken, sessionId } = useDebugCSRF();

  return (
    <div
      style={{
        padding: "1rem",
        background: "#fff9c4",
        color: "#333",
        fontSize: "0.9rem",
      }}
    >
      <h4 style={{ marginTop: 0 }}>🔍 Debug CSRF</h4>
      <div>
        <strong>csrftoken (cookie)</strong>: {cookieToken || "❌ introuvable"}
      </div>
      <div>
        <strong>X-CSRFToken (header)</strong>: {headerToken || "❌ non injecté"}
      </div>
      <div>
        <strong>sessionid</strong>: {sessionId || "❌ absent"}
      </div>
    </div>
  );
}
