import * as React from "react";
import { useEffect, useRef } from "react";
import { Html5Qrcode, Html5QrcodeScanner } from "html5-qrcode";

// @ts-ignore
const { QRCodeCanvas } = require("qrcode.react");

export interface QrCodeProps {
  userId?: string;
  mode: "create" | "scan" | "show";
  onScanSuccess?: (data: string) => void;
  stopAfterScan?: boolean;
  commercantId?: string;
}

function QrCode_(props: QrCodeProps, ref: React.Ref<HTMLDivElement>) {
  const {
    userId = "user_id_inconnu",
    mode,
    onScanSuccess,
    stopAfterScan = false,
    commercantId,
  } = props;

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasScanned = useRef(false);

  const getAccessTokenFromCookies = () => {
    const supabaseId = process.env.NEXT_PUBLIC_SUPABASE_ID;
    const match = document.cookie.match(new RegExp(`sb-${supabaseId}-auth-token=([^;]+)`));
    if (match?.[1]) {
      let token = match[1];
      if (token.startsWith("base64-")) {
        token = token.substring(7);
      }
      try {
        const decodedToken = JSON.parse(atob(token));
        return decodedToken.access_token;
      } catch (error) {
        console.error("Erreur lors du décodage du token:", error);
        return null;
      }
    }
    return null;
  };

  useEffect(() => {
    if (mode !== "scan" && mode !== "create") return;

    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices.length === 0) {
          console.warn("❌ Aucune caméra détectée");
        } else {
          console.log("📸 Caméras détectées :", devices);
        }
      })
      .catch((err) => {
        console.error("❌ Impossible d'accéder aux caméras :", err);
      });
  }, [mode]);

  useEffect(() => {
    if ((mode !== "scan" && mode !== "create") || !commercantId) return;

    if (!scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: 250 },
        false
      );

      scannerRef.current.render(
        async (decodedText: string) => {
          if (hasScanned.current) return;
          hasScanned.current = true;

          console.log("✅ QR Code scanné :", decodedText);

          const token = getAccessTokenFromCookies();
          if (!token) {
            console.error("❌ Token introuvable lors du scan");
            return;
          }

          const tableName =
            mode === "create" ? "fidelity_cards" : "fidelity_transactions";

          try {
            const res = await fetch("/api/supabase/insert-table", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                table: tableName,
                insert: {
                  merchant_id: commercantId,
                  user_id: decodedText,
                },
              }),
            });

            if (!res.ok) {
              console.error("❌ Erreur insert_table :", await res.text());
            } else {
              console.log(`✅ Insertion dans ${tableName} réussie`);
            }
          } catch (err) {
            console.error("❌ Erreur réseau :", err);
          }

          onScanSuccess?.(decodedText);

          if (stopAfterScan && scannerRef.current) {
            scannerRef.current.clear().catch((err) => {
              console.error("Erreur clear après scan :", err);
            });
          }
        },
        (errorMessage) => {
          console.warn("⚠️ Erreur scan :", errorMessage);
        }
      );
    }

    return () => {
      hasScanned.current = false;
      scannerRef.current?.clear().catch((err) => console.error("Erreur clear:", err));
      scannerRef.current = null;
    };
  }, [mode, onScanSuccess, commercantId, stopAfterScan]);

  return (
    <div ref={ref}>
      {mode === "show" ? (
        <QRCodeCanvas value={userId} size={200} />
      ) : (
        <div id="reader" ref={containerRef} />
      )}
    </div>
  );
}

const QrCode = React.forwardRef(QrCode_);
export default QrCode;
