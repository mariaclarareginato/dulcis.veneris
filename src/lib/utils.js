import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Helper para juntar classes de forma inteligente
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
