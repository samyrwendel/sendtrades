import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateBotId(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
} 