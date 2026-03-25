import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

// Esta página actúa como dispatcher: redirige según el estado de autenticación.
// El proxy maneja redirects para rutas no-root; este archivo cubre el caso de /.
export default async function RootPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const role = (session.user as any)?.role;
  const status = (session.user as any)?.status;

  if (role === "ADMIN") {
    redirect("/admin");
  }

  if (status === "APPROVED") {
    redirect("/guemajim");
  }

  redirect("/pendiente");
}
