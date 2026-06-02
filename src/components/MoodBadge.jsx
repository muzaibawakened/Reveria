import React from "react";

export default function MoodBadge({ mood, color, size = "sm" }) {
  if (!mood) return null;

  const sizeClasses = {
    sm: "px-2.5 py-0.5 text-[10px]",
    md: "px-3 py-1 text-xs",
    lg: "px-4 py-1.5 text-sm",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-ui uppercase tracking-[0.15em] ${sizeClasses[size]}`}
      style={{
        color: color,
        backgroundColor: `${color}15`,
        border: `1px solid ${color}30`,
        boxShadow: `0 0 12px ${color}10`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{
          backgroundColor: color,
          boxShadow: `0 0 6px ${color}60`,
        }}
      />
      {mood}
    </span>
  );
}