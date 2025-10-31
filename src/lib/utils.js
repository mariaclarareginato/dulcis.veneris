import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Helper para juntar classes de forma inteligente
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
export function generateRandomCode(length = 12) {
  let result = '';
  const characters = '0123456789';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}