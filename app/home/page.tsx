"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import authFacade from "@/facade/authFacade"; // ✅ CAMBIO AQUÍ
import dynamic from "next/dynamic";

import HomeNavbar from "@/components/HomeNavbar";

const MapaPrincipal = dynamic(() => import("@/components/MapaPrincipal"), {
  ssr: false,
});

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
  console.log("TOKEN EN HOME:", localStorage.getItem("token"));

  if (!authFacade.isLogged()) {
    console.log("ME ECHA POR isLogged = FALSE");
    router.push("/");
  } else {
    console.log("SESION OK");
  }
}, []);

  return (
    <>
      <HomeNavbar />
      <div style={{ paddingTop: "65px" }}>
        <MapaPrincipal />
      </div>
    </>
  );

}
