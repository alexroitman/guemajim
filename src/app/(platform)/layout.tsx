import { auth } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";
import { SessionProvider } from "next-auth/react";

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <SessionProvider>
      <div className="flex flex-col min-h-screen">
        <Navbar isAdmin={isAdmin} />
        <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-6" style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}>
          {children}
        </main>
      </div>
    </SessionProvider>
  );
}
