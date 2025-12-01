"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import sessionFacade from "@/facade/sessionFacade";
import dynamic from "next/dynamic";

import HomeNavbar from "@/components/HomeNavbar";

const MapaPrincipal = dynamic(() => import("@/components/MapaPrincipal"), {
  ssr: false,
});

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    if (!sessionFacade.isLogged()) {
      router.push("/");
    }
  }, []);

  return (
    <>
      <HomeNavbar />

      {/* Contenedor para evitar que el navbar tape parte del mapa */}
      <div style={{ paddingTop: "65px" }}>
        <MapaPrincipal />
      </div>
    </>
  );
}
