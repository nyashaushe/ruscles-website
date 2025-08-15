import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Re-export utility functions
export * from './utils/date'
export * from './utils/formatting'
export * from './utils/validation'
