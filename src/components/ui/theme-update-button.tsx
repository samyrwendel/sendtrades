import React, { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "../../lib/utils";

interface ThemeUpdateButtonProps {
  isUpdating: boolean;
  onClick?: () => void;
  className?: string;
  text?: string;
  updatingText?: string;
}

export function ThemeUpdateButton({
  isUpdating,
  onClick,
  className,
  text = "Atualizar",
  updatingText = "Atualizando..."
}: ThemeUpdateButtonProps) {
  const [colorPhase, setColorPhase] = useState(0);
  const [pulsePhase, setPulsePhase] = useState(0);
  
  // Cores para alternar durante a atualização
  const updateColors = [
    "#0AD85E", // Verde
    "#FF9800", // Laranja
    "#0AD85E"  // Verde novamente
  ];
  
  // Efeito para alternar as cores durante a atualização
  useEffect(() => {
    if (!isUpdating) {
      setColorPhase(0);
      setPulsePhase(0);
      return;
    }
    
    // Alternar cores a cada 800ms
    const colorInterval = setInterval(() => {
      setColorPhase((prev) => (prev + 1) % updateColors.length);
    }, 800);
    
    // Efeito de pulso a cada 400ms
    const pulseInterval = setInterval(() => {
      setPulsePhase((prev) => (prev + 1) % 3);
    }, 400);
    
    return () => {
      clearInterval(colorInterval);
      clearInterval(pulseInterval);
    };
  }, [isUpdating]);

  return (
    <button
      onClick={onClick}
      disabled={isUpdating}
      className={cn(
        "relative flex items-center justify-center px-3 py-2 rounded-md",
        "bg-black dark:bg-black border border-[#272727] dark:border-[#272727] text-white",
        "hover:bg-gray-900 hover:border-[#0AD85E]/30 transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-[#0AD85E] focus:ring-offset-0 focus-visible:ring-[#0AD85E] focus-visible:border-[#0AD85E]",
        "disabled:opacity-70 disabled:cursor-not-allowed",
        "h-10",
        className
      )}
    >
      <RefreshCw
        className={cn(
          "h-4 w-4 mr-2",
          isUpdating ? "animate-spin text-[#0AD85E]" : "text-[#0AD85E]",
          isUpdating && pulsePhase === 1 && "scale-110",
          isUpdating && pulsePhase === 2 && "scale-90"
        )}
        style={{
          color: isUpdating ? updateColors[colorPhase] : "#0AD85E"
        }}
      />
      <span className="text-sm">
        {isUpdating ? updatingText : text}
      </span>
      {isUpdating && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0AD85E] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#0AD85E]"></span>
        </span>
      )}
    </button>
  );
} 