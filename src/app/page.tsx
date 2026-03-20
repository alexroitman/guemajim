import { redirect } from "next/navigation";

// El middleware redirige a /login si no está autenticado,
// y a / (platform) si está aprobado. Este archivo es el catch-all.
export default function RootPage() {
  redirect("/login");
}
