import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
export function generateBotId() {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
}
