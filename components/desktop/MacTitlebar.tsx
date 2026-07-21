"use client";

import React, { useEffect, useState } from "react";

export function MacTitlebar() {
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    // Detect macOS environment
    if (typeof window !== "undefined" && window.navigator.platform.toUpperCase().indexOf("MAC") >= 0) {
      setIsMac(true);
    }
  }, []);

  if (!isMac) return null;

  return (
    <div
      className="w-full h-8 bg-transparent flex items-center justify-end px-4 select-none z-50 fixed top-0 left-0 right-0 pointer-events-auto"
      style={{
        WebkitAppRegion: "drag",
      } as React.CSSProperties}
    >
      <div
        className="flex items-center space-x-2"
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
      >
        {/* Interactive elements if needed, such as quick app actions */}
      </div>
    </div>
  );
}
