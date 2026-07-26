"use client";

// components/marketing/VoltaicLogo.tsx
// Official Voltaic Brand Logo component featuring vector lightning bolt and geometric typography.

import React from "react";

interface VoltaicLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export function VoltaicLogo({
  size = "md",
  showText = true,
  className = "",
}: VoltaicLogoProps) {
  const iconSizes = {
    sm: "w-6 h-6 rounded-md text-xs",
    md: "w-8 h-8 rounded-lg text-sm",
    lg: "w-11 h-11 rounded-xl text-base",
  };

  const svgSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4.5 h-4.5",
    lg: "w-6 h-6",
  };

  const textSizes = {
    sm: "text-base font-bold tracking-tight",
    md: "text-lg font-extrabold tracking-tight",
    lg: "text-2xl font-black tracking-tight",
  };

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Icon Badge */}
      <div
        className={`${iconSizes[size]} flex items-center justify-center bg-black text-amber-400 border border-amber-400/30 shadow-sm transition-transform duration-200 hover:scale-105`}
      >
        <svg
          className={`${svgSizes[size]} fill-current`}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="currentColor" />
        </svg>
      </div>

      {/* Brand Text */}
      {showText && (
        <span className={`${textSizes[size]} text-foreground`}>
          Voltaic
        </span>
      )}
    </div>
  );
}
