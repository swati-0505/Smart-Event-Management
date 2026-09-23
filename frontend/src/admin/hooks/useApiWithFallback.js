// useApiWithFallback.js
// Reusable hook: fetch from API, fall back to sample data when empty/error.

import { useState, useEffect, useCallback } from "react";

export function useApiWithFallback(fetcher, fallback, deps = []) {
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetcher();
      const list = Array.isArray(res) ? res : res ? [res] : [];
      const isEmpty = list.length === 0;

      setData(isEmpty ? fallback : list);
      setUsingFallback(isEmpty);
    } catch (err) {
      console.warn("API failed, using fallback:", err);
      setData(fallback);
      setUsingFallback(true);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    load();
  }, [load]);

  return { data, setData, loading, usingFallback, reload: load };
}
