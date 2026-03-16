// src/hooks/useFeatures.ts
import { useEffect, useState } from "react";
import { backend } from "@/core/backend";
import { Feature } from "@/core/types/feature";

export function useFeatures() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    backend.features
      .getAll()
      .then(setFeatures)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { features, loading, error };
}
