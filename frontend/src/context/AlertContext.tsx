import React, { createContext, useContext, useState } from "react";

export type AlertType = "success" | "error" | "info" | "warning";

export type AlertMessage = {
  id: string;
  type: AlertType;
  message: string;
  autoClose?: boolean;
  duration?: number;
};

const AlertContext = createContext<{
  alerts: AlertMessage[];
  addAlert: (type: AlertType, message: string) => void;
  removeAlert: (id: string) => void;
}>({
  alerts: [],
  addAlert: () => {},
  removeAlert: () => {},
});

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<AlertMessage[]>([]);

  const addAlert = (type: AlertType, message: string) => {
    const id = Date.now().toString();
    setAlerts((prev) => [...prev, { id, type, message }]);

    // Suppression automatique désactivée pour tester
    setTimeout(() => removeAlert(id), 3000);
  };

  const removeAlert = (id: string) => {
    console.trace("Suppression de l'alerte appelée :", id);
    setAlerts((prev) => {
        console.log("Alertes avant suppression :", prev);
        return prev.filter((alert) => alert.id !== id);
    });
  };

  return (
    <AlertContext.Provider value={{ alerts, addAlert, removeAlert }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlert = () => useContext(AlertContext);