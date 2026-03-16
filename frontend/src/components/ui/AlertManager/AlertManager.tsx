import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { AlertMessage } from "@context/AlertContext";

interface AlertManagerProps {
  alerts: AlertMessage[];
  onClose: (id: string) => void;
  maxAlerts?: number;
  position?: "top" | "bottom" | "inline";
}

const AlertManager: React.FC<AlertManagerProps> = ({
  alerts,
  onClose,
  maxAlerts = 3,
  position = "top",
}) => {
  const [visibleAlerts, setVisibleAlerts] = useState<AlertMessage[]>([]);

  useEffect(() => {
    // Limite à maxAlerts
    setVisibleAlerts(alerts.slice(0, maxAlerts));
  }, [alerts, maxAlerts]);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    visibleAlerts.forEach((alert) => {
      if (alert.autoClose !== false) {
        const timer = setTimeout(() => {
          onClose(alert.id);
        }, alert.duration || 5000);

        timers.push(timer);
      }
    });

    return () => timers.forEach((t) => clearTimeout(t));
  }, [visibleAlerts, onClose]);

  const containerStyle: React.CSSProperties = {
    position: "fixed",
    zIndex: 9999,
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    [position]: "20px",
    right: "20px",
  };

  return (
    <div style={containerStyle}>
      <AnimatePresence>
        {visibleAlerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            layout
            style={{
              padding: "12px 20px",
              borderRadius: "8px",
              color: "white",
              backgroundColor:
                alert.type === "success"
                  ? "#4caf50"
                  : alert.type === "error"
                  ? "#f44336"
                  : alert.type === "warning"
                  ? "#ff9800"
                  : "#2196f3",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              minWidth: "250px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>{alert.message}</span>
            <button
              onClick={() => onClose(alert.id)}
              style={{
                background: "transparent",
                border: "none",
                color: "white",
                fontSize: "18px",
                cursor: "pointer",
                marginLeft: "12px",
              }}
            >
              ×
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default AlertManager;
