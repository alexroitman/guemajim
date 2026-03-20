import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const GEMACH_CATEGORIES = [
  "Ropa",
  "Bebé y niños",
  "Equipamiento médico",
  "Hogar",
  "Electrodomésticos",
  "Libros y judaica",
  "Muebles",
  "Electrónica",
  "Juguetes",
  "Otro",
];

export const ITEM_CATEGORIES = [
  "Ropa",
  "Bebé y niños",
  "Equipamiento médico",
  "Hogar",
  "Electrodomésticos",
  "Libros",
  "Muebles",
  "Electrónica",
  "Juguetes",
  "Otro",
];

export const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  APPROVED: "Aprobado",
  REJECTED: "Rechazado",
};

export const ITEM_TYPE_LABELS: Record<string, string> = {
  LEND: "Para prestar",
  GIVE: "Para regalar",
};

export const ITEM_STATUS_LABELS: Record<string, string> = {
  AVAILABLE: "Disponible",
  REQUESTED: "Solicitado",
  TAKEN: "Entregado",
};

export const REQUEST_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  ACCEPTED: "Aceptado",
  REJECTED: "Rechazado",
};
