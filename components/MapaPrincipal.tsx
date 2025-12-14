"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapaPrincipalProps {
  center?: [number, number] | null;
}

export default function MapaPrincipal({ center }: MapaPrincipalProps) {
  // Usamos una referencia para guardar el objeto del mapa y usarlo luego
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    const mapDiv = document.getElementById("map");

    // Evitar crear el mapa más de una vez
    if (!mapDiv || mapDiv.children.length > 0 || mapRef.current) return;

    // Guardamos la instancia en mapRef.current
    const map = L.map("map").setView([39.986, -0.05], 13);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    setTimeout(() => {
      map.invalidateSize();
    }, 0);
  }, []);

  // ✅ NUEVO: Este efecto detecta cuando 'center' cambia y mueve el mapa
  useEffect(() => {
    if (mapRef.current && center) {
      mapRef.current.setView(center, 15, {
        animate: true, // Movimiento suave
        duration: 1.0  // Duración del desplazamiento
      });
    }
  }, [center]);

  return (
    <div
      id="map"
      style={{
        width: "100%",
        height: "100%",
        zIndex: 1 // Aseguramos que esté al fondo
      }}
    />
  );
}