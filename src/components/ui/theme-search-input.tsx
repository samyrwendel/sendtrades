import React from "react";
import { Search } from "lucide-react";
import { Input } from "./input";
import { cn } from "../../lib/utils";
import { themeClasses } from "../../lib/theme/colors";

interface ThemeSearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  iconClassName?: string;
}

export function ThemeSearchInput({ 
  className, 
  iconClassName, 
  placeholder = "Buscar...", 
  ...props 
}: ThemeSearchInputProps) {
  return (
    <div className={cn(themeClasses.layout.filterInput, className)}>
      <Search 
        className={cn(
          "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#0AD85E]", 
          iconClassName
        )} 
      />
      <Input
        placeholder={placeholder}
        className={cn(
          "pl-10 bg-black dark:bg-black border border-[#272727] dark:border-[#272727] text-white hover:bg-gray-900 hover:border-[#0AD85E]/30 transition-colors focus:ring-[#0AD85E] focus:border-[#0AD85E] focus:ring-offset-0 focus-visible:ring-[#0AD85E] focus-visible:ring-offset-0 h-10",
          themeClasses.input.placeholder
        )}
        {...props}
      />
    </div>
  );
} 