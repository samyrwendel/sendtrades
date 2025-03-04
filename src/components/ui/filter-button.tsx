import React from "react";
import { cn } from "../../lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { LucideIcon } from "lucide-react";

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterButtonProps {
  icon: LucideIcon;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: FilterOption[];
  className?: string;
}

export function FilterButton({
  icon: Icon,
  label,
  value,
  onValueChange,
  options,
  className
}: FilterButtonProps) {
  return (
    <div className={cn("flex-1 md:flex-auto", className)}>
      <Select
        value={value}
        onValueChange={onValueChange}
      >
        <SelectTrigger className="w-full md:w-[160px] bg-black dark:bg-black border border-[#272727] dark:border-[#272727] text-white hover:bg-gray-900 hover:border-[#0AD85E]/30 transition-colors focus:ring-[#0AD85E] focus:border-[#0AD85E] focus:ring-offset-0 data-[state=open]:border-[#0AD85E] data-[state=open]:ring-[#0AD85E] h-10 px-3 text-sm">
          <div className="flex items-center justify-center w-full overflow-hidden">
            <Icon className="h-5 w-5 mr-2 text-[#0AD85E] flex-shrink-0" />
            <span className="whitespace-nowrap text-center truncate">{label}</span>
          </div>
        </SelectTrigger>
        <SelectContent className="bg-black dark:bg-black border-[#272727] text-white">
          {options.map((option) => (
            <SelectItem 
              key={option.value} 
              value={option.value} 
              className="focus:bg-gray-900 focus:text-white data-[highlighted]:bg-[#0AD85E]/10 data-[highlighted]:text-white"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
} 