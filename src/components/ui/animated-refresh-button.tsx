import React, { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "../../lib/utils";
import { colors } from "../../lib/theme/colors";

interface AnimatedRefreshButtonProps {
  isRefreshing: boolean;
  text?: string;
  refreshingText?: string;
  onClick?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "ghost";
}

export function AnimatedRefreshButton({
  isRefreshing,
  text = "Atualizar",
  refreshingText = "Atualizando...",
  onClick,
  className,
  size = "md",
  variant = "default"
}: AnimatedRefreshButtonProps) {
  const [pulseState, setPulseState] = useState(0);
  const [colorIndex, setColorIndex] = useState(0);
  
  const colors = [
    "#0AD85E", // Verde principal
    "#FF9800", // Laranja
    "#0AD85E"  // Verde principal novamente
  ];
  
  // Efeito para alternar as cores durante a atualização
  useEffect(() => {
    if (!isRefreshing) {
      setColorIndex(0);
      setPulseState(0);
      return;
    }
    
    // Alternar cores
    const colorInterval = setInterval(() => {
      setColorIndex((prev) => (prev + 1) % colors.length);
    }, 800);
    
    // Efeito de pulso
    const pulseInterval = setInterval(() => {
      setPulseState((prev) => (prev + 1) % 3);
    }, 400);
    
    return () => {
      clearInterval(colorInterval);
      clearInterval(pulseInterval);
    };
  }, [isRefreshing]);
  
  // Tamanhos do botão
  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-2 text-sm",
    lg: "px-4 py-3 text-base"
  };
  
  // Variantes do botão
  const variantClasses = {
    default: "bg-white dark:bg-[var(--md-surface-1)] border border-gray-200 dark:border-[var(--md-surface-4)] text-gray-700 dark:text-[var(--md-on-surface)]",
    outline: "bg-transparent border border-gray-200 dark:border-[var(--md-surface-4)] text-gray-700 dark:text-[var(--md-on-surface)]",
    ghost: "bg-transparent text-gray-700 dark:text-[var(--md-on-surface)]"
  };
  
  // Efeito de pulso
  const pulseScale = isRefreshing ? [1, 1.05, 1][pulseState] : 1;
  
  return (
    <button
      onClick={onClick}
      disabled={isRefreshing}
      className={cn(
        "flex items-center gap-2 rounded-md transition-all",
        sizeClasses[size],
        variantClasses[variant],
        isRefreshing ? "opacity-90" : "hover:bg-gray-50 dark:hover:bg-[var(--md-surface-2)]",
        className
      )}
      style={{
        transform: `scale(${pulseScale})`,
        transition: "transform 0.2s ease-in-out, color 0.3s ease-in-out"
      }}
    >
      <RefreshCw 
        className={cn(
          "transition-all",
          size === "sm" ? "h-3 w-3" : size === "md" ? "h-4 w-4" : "h-5 w-5",
          isRefreshing ? "animate-spin" : ""
        )} 
        style={{ color: isRefreshing ? colors[colorIndex] : "#0AD85E" }}
      />
      <span 
        className="transition-colors"
        style={{ color: isRefreshing ? colors[colorIndex] : undefined }}
      >
        {isRefreshing ? refreshingText : text}
      </span>
      
      {/* Efeito de brilho ao redor */}
      {isRefreshing && (
        <div 
          className="absolute inset-0 rounded-md pointer-events-none"
          style={{
            boxShadow: `0 0 8px ${colors[colorIndex]}`,
            opacity: pulseState === 1 ? 0.7 : 0.3,
            transition: "box-shadow 0.3s ease-in-out, opacity 0.3s ease-in-out"
          }}
        />
      )}
    </button>
  );
}