// src/hooks/useComponents.ts
import { useEffect, useState } from "react";
import { backend } from "@/core/backend";
import { Component } from "@/core/types/component";

export function useComponents() {
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    backend.components
      .getAll()
      .then(setComponents)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { components, loading, error };
}
