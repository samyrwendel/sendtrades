import React from "react";
import { cn } from "../../lib/utils";
import { themeClasses } from "../../lib/theme/colors";

interface PageHeaderProps {
  title: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, children, className }: PageHeaderProps) {
  return (
    <div className={cn(themeClasses.layout.header, className)}>
      <h1 className={themeClasses.heading.h1}>{title}</h1>
      {children}
    </div>
  );
}

interface PageFilterSectionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageFilterSection({ children, className }: PageFilterSectionProps) {
  return (
    <div className={cn(themeClasses.layout.filters, className)}>
      {children}
    </div>
  );
}

interface PageContentProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContent({ children, className }: PageContentProps) {
  return (
    <div className={cn("mt-6", className)}>
      {children}
    </div>
  );
}

interface PageSectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function PageSection({ title, children, className }: PageSectionProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {title && <h2 className={themeClasses.heading.h2}>{title}</h2>}
      {children}
    </div>
  );
}

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function PageLayout({ children, className }: PageLayoutProps) {
  return (
    <div className={cn(themeClasses.layout.page, className)}>
      {children}
    </div>
  );
}
