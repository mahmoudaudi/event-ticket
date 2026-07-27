"use client";

import { useEffect, useRef, useState } from "react";

interface UseDebouncedFetchOptions {
  debounceMs?: number;
  onError?: (message: string) => void;
}

/**
 * Fetches `url` after a debounce delay, aborting any still-in-flight
 * request from a previous call. This is what makes table search/filter
 * boxes reliable: without the AbortController, a slow response to an
 * earlier keystroke can resolve *after* a faster response to a later one
 * and silently overwrite it with stale (or empty) results.
 *
 * The very first render is skipped — the caller already has server-fetched
 * `initialData`, so there's no need to immediately re-fetch on mount.
 */
export function useDebouncedFetch<T>(
  url: string,
  initialData: T,
  { debounceMs = 300, onError }: UseDebouncedFetchOptions = {}
) {
  const [data, setData] = useState<T>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
        const json = (await res.json()) as T;
        setData(json);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          onError?.("Couldn't load results. Please try again.");
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }, debounceMs);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
    // Re-run whenever the computed URL changes; `onError` is stable enough in practice.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  return { data, setData, isLoading };
}
