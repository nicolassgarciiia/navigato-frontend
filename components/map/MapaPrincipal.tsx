"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapaPrincipalProps {
  center?: [number, number] | null;
  onMapClick?: (lat: number, lng: number) => void;
}

export default function MapaPrincipal({ center, onMapClick }: MapaPrincipalProps) {
  const mapRef = useRef<L.Map | null>(null);

  // 1) Crear mapa SOLO una vez
  useEffect(() => {
    const mapDiv = document.getElementById("map");
    if (!mapDiv || mapRef.current) return;

    const map = L.map("map").setView([39.986, -0.05], 13);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    setTimeout(() => {
      map.invalidateSize();
    }, 0);
  }, []);

  // 2) Enganchar / desenganchar click cuando cambie onMapClick
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handler = (e: L.LeafletMouseEvent) => {
      onMapClick?.(e.latlng.lat, e.latlng.lng);
    };

    map.on("click", handler);

    return () => {
      map.off("click", handler);
    };
  }, [onMapClick]);

  // 3) Mover mapa cuando cambie center
  useEffect(() => {
<<<<<<< Updated upstream
    const map = mapRef.current;
    if (map && center) {
      map.setView(center, 15, { animate: true, duration: 1.0 });
    }
  }, [center]);

=======
  const map = mapRef.current;
  if (!map || !center) return;

  if (routeLayerRef.current) return;

  map.setView(center, 15, { animate: true, duration: 1.0 });
}, [center]);


  // 4) DIBUJAR RUTA 
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }

    if (routeLine && routeLine.length > 1) {
      const polyline = L.polyline(routeLine, {
        color: "#2563eb",
        weight: 5,
        opacity: 0.9,
      }).addTo(map);

      routeLayerRef.current = polyline;
      map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
    }
  }, [routeLine]);

>>>>>>> Stashed changes
  return (
    <div
      id="map"
      style={{
        width: "100%",
        height: "100%",
        zIndex: 1,
      }}
    />
  );
}
