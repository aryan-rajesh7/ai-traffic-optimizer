import { useState, useEffect, useCallback } from "react";

export interface Intersection {
  name: string;
  city: string;
  lat: number;
  lon: number;
  congestion_score: number;
  road_closure: boolean;
  confidence: number;
}

export function useTrafficData() {
  const [traffic, setTraffic] = useState<Intersection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [customLocations, setCustomLocations] = useState<Intersection[]>([]);

  const fetchTraffic = useCallback(async (manual = false, retryDelay = 10000) => {
    if (manual) setRefreshing(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/traffic`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setTraffic(data.traffic ?? []);
      setLastUpdated(new Date());
      setError(null);
    } catch {
      setError("Backend starting up...");
      const nextDelay = Math.min(retryDelay * 1.5, 60000);
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        setTimeout(() => fetchTraffic(false, nextDelay), retryDelay);
      }
    } finally {
      setLoading(false);
      if (manual) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTraffic();
  }, [fetchTraffic]);

  const addCustomLocation = (location: Intersection) => {
    setCustomLocations((prev) => [...prev, location]);
  };

  const removeCustomLocation = (name: string) => {
    setCustomLocations((prev) => prev.filter((l) => l.name !== name));
  };

  return {
    traffic,
    loading,
    error,
    lastUpdated,
    refreshing,
    refetch: () => fetchTraffic(true),
    customLocations,
    addCustomLocation,
    removeCustomLocation,
  };
}
