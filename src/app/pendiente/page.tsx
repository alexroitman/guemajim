"use client";

import dynamic from "next/dynamic";

const PendienteClient = dynamic(() => import("./PendienteClient"), {
  ssr: false,
});

export default function PendientePage() {
  return <PendienteClient />;
}
