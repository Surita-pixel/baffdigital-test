import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ProcedureValues } from "./schema";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const calculateTotal = (procedure: ProcedureValues, discount: number): number => {
  const subtotal = procedure.prices.reduce((sum, price) => sum + price.amount, 0);
  const iva = subtotal * 0.19;
  const totalWithIva = subtotal + iva;
  const discountAmount = totalWithIva * (discount / 100);
  const finalTotal = totalWithIva - discountAmount;
  return finalTotal;  
};
