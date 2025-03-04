import React from "react";
import { cn } from "../../lib/utils";
import { themeClasses } from "../../lib/theme/colors";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function ThemedCard({ className, ...props }: CardProps) {
  return <div className={cn(themeClasses.card.base, className)} {...props} />;
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function ThemedCardHeader({ className, ...props }: CardHeaderProps) {
  return <div className={cn("p-6 pb-3", className)} {...props} />;
}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  className?: string;
}

export function ThemedCardTitle({ className, ...props }: CardTitleProps) {
  return <h3 className={cn("text-xl font-semibold", themeClasses.card.header, className)} {...props} />;
}

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  className?: string;
}

export function ThemedCardDescription({ className, ...props }: CardDescriptionProps) {
  return <p className={cn("text-sm", themeClasses.card.content, className)} {...props} />;
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function ThemedCardContent({ className, ...props }: CardContentProps) {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function ThemedCardFooter({ className, ...props }: CardFooterProps) {
  return <div className={cn("p-6 pt-0 flex items-center", className)} {...props} />;
}
