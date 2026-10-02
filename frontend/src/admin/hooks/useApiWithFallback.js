 
import { useState, useEffect, useCallback } from "react";
const DEMO_MODE = import.meta.env?.VITE_DEMO_MODE === "true";
 
export function useApiWithFallback(fetcher, fallback = [], deps = []) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingFallback, setUsingFallback] = useState(false);
 
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetcher();
      const list = Array.isArray(res) ? res : res ? [res] : [];
      setData(list); // empty stays empty
      setUsingFallback(false);
    } catch (err) {
      console.error("API failed:", err);
      setError(err?.message || "Failed to fetch");
      if (DEMO_MODE) {
        setData(fallback);
        setUsingFallback(true);
      } else {
        setData([]);
        setUsingFallback(false);
      }
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
 
  useEffect(() => {
    load();
  }, [load]);
 
  return { data, setData, loading, error, usingFallback, reload: load };
}
 