import * as React from "react";
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export interface LeafletMapProps {
  mode: "user" | "commerce";
  lat?: number;
  lon?: number;
  zoomMap?: number;
  heightMap?: string;
  widthMap?: string;
  markerIconUrl?: string;
  markerShadowUrl?: string;
}

function LeafletMapInner(props: LeafletMapProps, ref: React.Ref<HTMLDivElement>) {
  const {
    mode,
    lat,
    lon,
    zoomMap = 13,
    heightMap = "400px",
    widthMap = "100%",
    markerIconUrl = "/marker-icon-green.png",
    markerShadowUrl = "/marker-shadow.png",
  } = props;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const merchantMarkersRef = useRef<L.Marker[]>([]);

  const [mapCenter, setMapCenter] = useState<[number, number]>([48.8566, 2.3522]);

  // --- Détermination du centre ---
  useEffect(() => {
    if (mode === "commerce" && lat !== undefined && lon !== undefined) {
      setMapCenter([lat, lon]);
      return;
    }

    if (mode === "user" && lat !== undefined && lon !== undefined) {
      setMapCenter([lat, lon]);
      return;
    }

    if (mode === "user" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setMapCenter([pos.coords.latitude, pos.coords.longitude]),
        err => console.error("Erreur géoloc", err),
        { enableHighAccuracy: true }
      );
    }
  }, [mode, lat, lon]);

  // --- Initialisation de la map ---
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapRef.current = L.map(containerRef.current).setView(mapCenter, zoomMap);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
    }).addTo(mapRef.current);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // --- Recentrage ---
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setView(mapCenter, zoomMap, { animate: true });
  }, [mapCenter, zoomMap]);

  // --- Icônes ---
  const userIcon = L.icon({
    iconUrl: "/marker-icon-blue.png",
    shadowUrl: markerShadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  const merchantIcon = L.icon({
    iconUrl: markerIconUrl,
    shadowUrl: markerShadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  // --- Marker utilisateur ---
  useEffect(() => {
    if (!mapRef.current) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng(mapCenter);
    } else {
      userMarkerRef.current = L.marker(mapCenter, { icon: userIcon })
        .addTo(mapRef.current)
        .bindPopup("Vous êtes ici");
    }
  }, [mapCenter]);

  // --- Commerçants ---
  useEffect(() => {
    if (!mapRef.current) return;

    const fetchNearby = async () => {
      const res = await fetch("/api/supabase/merchants-nearby", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat: mapCenter[0], lon: mapCenter[1] }),
      });

      const data: {
        lat: number;
        lon: number;
        address?: string;
        city?: string;
      }[] = await res.json();

      // nettoyage anciens markers
      merchantMarkersRef.current.forEach(m => m.remove());
      merchantMarkersRef.current = [];

      data.forEach(m => {
        const marker = L.marker([m.lat, m.lon], { icon: merchantIcon })
          .addTo(mapRef.current!)
          .bindTooltip(
            `${m.address ?? "Adresse inconnue"}${m.city ? `, ${m.city}` : ""}`,
            { direction: "top", offset: [0, -10], opacity: 1 }
          );

        merchantMarkersRef.current.push(marker);
      });
    };

    fetchNearby();
  }, [mapCenter]);

  return (
    <div
      ref={node => {
        containerRef.current = node;
        if (typeof ref === "function") ref(node);
      }}
      style={{ width: widthMap, height: heightMap }}
    />
  );
}

const LeafletMap = React.forwardRef(LeafletMapInner);
export default LeafletMap;
