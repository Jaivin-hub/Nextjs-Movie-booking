"use client";
import { useState, useEffect } from "react";
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient({
  defaultOptions: {
    mutations: { onError: () => {} },
  },
});

/** Devtools only render on client after mount to avoid hydration mismatch. */
function DevtoolsWrapper() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? <ReactQueryDevtools initialIsOpen={false} /> : null;
}

export default function Provider({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <DevtoolsWrapper />
    </QueryClientProvider>
  );
}