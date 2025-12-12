"use client";

import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function MapaPrincipal() {
  useEffect(() => {
    const mapDiv = document.getElementById("map");

    // Evita crear el mapa más de una vez
    if (mapDiv && mapDiv.children.length > 0) return;

    const map = L.map("map").setView([39.986, -0.05], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);
  }, []);

  return (
    <div
      id="map"
      style={{
        width: "100vw",
        height: "100vh",
      }}
    />
  );
}
