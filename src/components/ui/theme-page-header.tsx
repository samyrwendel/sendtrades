import React, { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface ThemePageHeaderProps {
  title: string;
  children?: ReactNode;
  className?: string;
}

export function ThemePageHeader({ title, children, className }: ThemePageHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between w-full mb-4", className)}>
      <h1 className="text-xl font-semibold text-gray-900 dark:text-[var(--md-on-surface)]">
        {title}
      </h1>
      {children && (
        <div className="flex items-center">
          {children}
        </div>
      )}
    </div>
  );
} 