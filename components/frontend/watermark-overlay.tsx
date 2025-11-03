"use client";

import React from "react";
import clsx from "clsx";

interface WatermarkOverlayProps {
  visible?: boolean;
  text?: string;
  className?: string;
}

export function WatermarkOverlay({
  visible = true,
  text = "KIAORA",
  className,
}: WatermarkOverlayProps) {
  if (!visible) return null;
  return (
    <div
      className={clsx(
        "absolute inset-0 pointer-events-none flex items-center justify-center",
        className
      )}
    >
      <span className="select-none text-white/10 font-black text-6xl sm:text-7xl tracking-widest transform -rotate-12 z-10">
        {text}
      </span>
    </div>
  );
}

export default WatermarkOverlay;