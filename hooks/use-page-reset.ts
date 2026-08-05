"use client";

import { useState } from "react";

/**
 * Keeps pagination at page 1 whenever filter dependencies change,
 * without using an effect (avoids cascading setState-in-effect lint).
 */
export function usePageReset(deps: unknown[]) {
  const [page, setPage] = useState(1);
  const key = deps.map((dep) => String(dep)).join("|");
  const [prevKey, setPrevKey] = useState(key);

  if (key !== prevKey) {
    setPrevKey(key);
    setPage(1);
  }

  return [page, setPage] as const;
}
