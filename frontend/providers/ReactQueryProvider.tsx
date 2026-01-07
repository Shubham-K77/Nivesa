"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";

export default function ReactQueryProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  //Constants
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, //The data is considerd fresh for five minutes only.
        retry: 1, //After fail to fetch initially, it will be fetched again 1 more time.
      },
    },
  });
  //Return
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
