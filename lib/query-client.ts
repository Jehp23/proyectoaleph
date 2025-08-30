import { QueryClient } from "@tanstack/react-query"

// Create a client with optimized settings for blockchain data
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 1000, // 5 seconds - blockchain data changes frequently
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
    },
  },
})
