import React, { useEffect, useState } from "react";

interface LeafletDistanceChipProps {
  lat?: number;
  lon?: number;
  merchantLat: number;
  merchantLon: number;
  maxDistanceKm?: number;
  className?: string;
}

const LeafletDistanceChip = (props: LeafletDistanceChipProps) => {
  const {
    lat: propLat,
    lon: propLon,
    merchantLat: rawMerchantLat,
    merchantLon: rawMerchantLon,
    maxDistanceKm = 10,
    className = "",
  } = props;

  const merchantLat = typeof rawMerchantLat === "string" ? parseFloat(rawMerchantLat) : rawMerchantLat;
  const merchantLon = typeof rawMerchantLon === "string" ? parseFloat(rawMerchantLon) : rawMerchantLon;

  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);

  function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  useEffect(() => {
    if (typeof propLat === "number" && typeof propLon === "number") {
      setUserCoords({ lat: propLat, lon: propLon });
    } else if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        },
        (err) => {
          console.error("Erreur géolocalisation dans LeafletDistanceChip:", err);
          setUserCoords(null);
        },
        { enableHighAccuracy: true }
      );
    }
  }, [propLat, propLon]);

  useEffect(() => {
    if (userCoords) {
      const dist = getDistanceFromLatLonInKm(
        userCoords.lat,
        userCoords.lon,
        merchantLat,
        merchantLon
      );
      setDistanceKm(dist);
    }
  }, [userCoords, merchantLat, merchantLon]);

  return (
    <div className={className}>
      {distanceKm === null ? (
        <span>Calcul de distance…</span>
        ) : (
        <span
            style={{
            display: "inline-block",
            padding: "0.25em 0.75em",
            fontSize: "0.85rem",
            fontWeight: "600",
            borderRadius: "9999px",
            backgroundColor: "#4caf50",
            color: "white",
            userSelect: "none",
            }}
            aria-label={`Distance ${distanceKm.toFixed(1)} kilomètres`}
        >
            {distanceKm.toFixed(1)} km
        </span>
        )}


      {/* Affiche toujours les coordonnées
      {userCoords && (
        <small style={{ display: "block", marginTop: "0.25em", color: "#666", fontSize: "0.75rem" }}>
            Utilisateur: {userCoords.lat.toFixed(5)}, {userCoords.lon.toFixed(5)}<br />
            Commerçant: {merchantLat?.toFixed(5)}, {merchantLon?.toFixed(5)}
        </small>

      )} */}
    </div>
  );
};

export default LeafletDistanceChip;
