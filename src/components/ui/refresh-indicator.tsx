import React, { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "../../lib/utils";
import { colors } from "../../lib/theme/colors";

interface RefreshIndicatorProps {
  isRefreshing: boolean;
  text?: string;
  refreshingText?: string;
  onClick?: () => void;
  className?: string;
  pulseColors?: string[];
  pulseInterval?: number;
}

export function RefreshIndicator({
  isRefreshing,
  text = "Atualizar",
  refreshingText = "Atualizando...",
  onClick,
  className,
  pulseColors = [
    colors.neon.green.primary, 
    colors.neon.orange.primary, 
    colors.neon.green.primary
  ],
  pulseInterval = 800
}: RefreshIndicatorProps) {
  const [colorIndex, setColorIndex] = useState(0);
  
  // Efeito para alternar as cores durante a atualização
  useEffect(() => {
    if (!isRefreshing) {
      setColorIndex(0);
      return;
    }
    
    const interval = setInterval(() => {
      setColorIndex((prev) => (prev + 1) % pulseColors.length);
    }, pulseInterval);
    
    return () => clearInterval(interval);
  }, [isRefreshing, pulseColors, pulseInterval]);
  
  return (
    <button
      onClick={onClick}
      disabled={isRefreshing}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-md transition-all",
        "bg-white dark:bg-[var(--md-surface-1)]",
        "border border-gray-200 dark:border-[var(--md-surface-4)]",
        "text-gray-700 dark:text-[var(--md-on-surface)]",
        isRefreshing ? "opacity-90" : "hover:bg-gray-50 dark:hover:bg-[var(--md-surface-2)]",
        className
      )}
    >
      <RefreshCw 
        className={cn(
          "h-4 w-4 transition-all",
          isRefreshing ? "animate-spin" : "",
          isRefreshing ? { color: pulseColors[colorIndex] } : "text-[#0AD85E]"
        )} 
        style={isRefreshing ? { color: pulseColors[colorIndex] } : undefined}
      />
      <span 
        className="transition-colors"
        style={isRefreshing ? { color: pulseColors[colorIndex] } : undefined}
      >
        {isRefreshing ? refreshingText : text}
      </span>
    </button>
  );
}