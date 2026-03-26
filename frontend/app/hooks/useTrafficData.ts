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

  const fetchTraffic = useCallback(async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/traffic`
      );
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setTraffic(data.traffic ?? []);
      setError(null);
    } 
    catch (err) {
      setError("Failed to fetch traffic data");
    } finally {
      setLoading(false);
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

  return { traffic, loading, error, refetch: fetchTraffic };
}