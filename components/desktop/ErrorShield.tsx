"use client";

import { useEffect } from "react";

export function ErrorShield() {
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      // Intercept Yjs/ProseMirror relativePositionToAbsolutePosition crashes gracefully
      const isYjsError = 
        event.error?.message?.includes("Unexpected case") || 
        event.message?.includes("Unexpected case") ||
        event.error?.stack?.includes("relativePositionToAbsolutePosition") ||
        event.error?.stack?.includes("cursor-plugin");

      if (isYjsError) {
        console.warn("[Voltaic Shield] Intercepted and suppressed Yjs/ProseMirror cursor sync error:", event.message);
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
      }
    };

    window.addEventListener("error", handleGlobalError, true);
    return () => window.removeEventListener("error", handleGlobalError, true);
  }, []);

  return null;
}
