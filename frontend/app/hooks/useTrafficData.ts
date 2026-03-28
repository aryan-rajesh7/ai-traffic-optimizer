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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  let retryDelay = 10000;

  const fetchTraffic = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/traffic`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setTraffic(data.traffic ?? []);
      setLastUpdated(new Date());
      setError(null);

      retryDelay = 10000;
    } catch (err) {
      setError("Backend waking up... Please wait 1-2 minutes");
      retryDelay = Math.min(retryDelay * 1.5, 60000); // max 60s

      if (document.visibilityState === "visible") {
        setTimeout(() => fetchTraffic(), retryDelay);
      }
    } finally {
      setLoading(false);
      if (manual) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      await fetchTraffic();
    };
    load();
    const interval = setInterval(() => {
      if (!cancelled) fetchTraffic();
    }, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [fetchTraffic]);

  return {
    traffic,
    loading,
    error,
    lastUpdated,
    refreshing,
    refetch: () => fetchTraffic(true),
  };
}