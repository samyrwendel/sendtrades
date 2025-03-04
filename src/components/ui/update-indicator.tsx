import React, { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "../../lib/utils";

interface UpdateIndicatorProps {
  isUpdating: boolean;
  lastUpdateTime?: string;
  onClick?: () => void;
  className?: string;
  showLastUpdateTime?: boolean;
}

export function UpdateIndicator({
  isUpdating,
  lastUpdateTime,
  onClick,
  className,
  showLastUpdateTime = false
}: UpdateIndicatorProps) {
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
  
  // Calcular o tamanho do pulso
  const pulseScale = isUpdating ? [1, 1.05, 1][pulsePhase] : 1;
  
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
        className
      )}
      style={{
        transform: isUpdating ? `scale(${pulseScale})` : undefined,
        transition: "transform 0.2s ease-in-out"
      }}
    >
      <RefreshCw 
        className={cn(
          "h-4 w-4 transition-all",
          isUpdating ? "animate-spin" : ""
        )} 
        style={{ 
          color: isUpdating ? updateColors[colorPhase] : "#0AD85E"
        }}
      />
      
      <div className="flex flex-col items-start">
        <span 
          className="text-sm font-medium transition-colors"
          style={{ 
            color: isUpdating ? updateColors[colorPhase] : undefined
          }}
        >
          {isUpdating ? "Atualizando..." : "Atualizar"}
        </span>
        
        {showLastUpdateTime && lastUpdateTime && !isUpdating && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Última atualização: {lastUpdateTime}
          </span>
        )}
      </div>
      
      {/* Efeito de brilho ao redor */}
      {isUpdating && (
        <div 
          className="absolute inset-0 rounded-md pointer-events-none"
          style={{
            boxShadow: `0 0 10px ${updateColors[colorPhase]}`,
            opacity: pulsePhase === 1 ? 0.5 : 0.2,
            transition: "box-shadow 0.3s ease-in-out, opacity 0.3s ease-in-out"
          }}
        />
      )}
    </button>
  );
}
