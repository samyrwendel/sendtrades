import React from "react";
import { cn } from "../../lib/utils";
import { themeClasses } from "../../lib/theme/colors";

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  className?: string;
}

export function Table({ className, ...props }: TableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-[var(--md-surface-4)]">
      <table className={cn(themeClasses.table.base, className)} {...props} />
    </div>
  );
}

interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  className?: string;
}

export function TableHeader({ className, ...props }: TableHeaderProps) {
  return <thead className={cn(themeClasses.table.header, className)} {...props} />;
}

interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  className?: string;
}

export function TableBody({ className, ...props }: TableBodyProps) {
  return <tbody className={cn(themeClasses.table.body, className)} {...props} />;
}

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  className?: string;
}

export function TableRow({ className, ...props }: TableRowProps) {
  return <tr className={cn(themeClasses.table.row, className)} {...props} />;
}

interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  className?: string;
}

export function TableHead({ className, ...props }: TableHeadProps) {
  return <th className={cn(themeClasses.table.headerCell, className)} {...props} />;
}

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  className?: string;
}

export function TableCell({ className, ...props }: TableCellProps) {
  return <td className={cn(themeClasses.table.cell, className)} {...props} />;
}

interface TableCellSecondaryProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  className?: string;
}

export function TableCellSecondary({ className, ...props }: TableCellSecondaryProps) {
  return <td className={cn(themeClasses.table.cellSecondary, className)} {...props} />;
}

interface EmptyStateProps {
  message: string;
  className?: string;
}

export function EmptyState({ message, className }: EmptyStateProps) {
  return (
    <div className={cn("text-center py-8", themeClasses.text.secondary, className)}>
      {message}
    </div>
  );
}