/**
 * Main Application Component
 * Root component with providers and global configuration
 */

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AppRouter } from './Router';
import '../styles/cybersecurity.css';

// Configure React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000, // 30 seconds
    },
  },
});

/**
 * Main App Component
 */
const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1a1410',
            color: '#fff',
            border: '1px solid #E4393C',
            fontFamily: 'Share Tech Mono, monospace',
          },
          success: {
            iconTheme: {
              primary: '#00ff88',
              secondary: '#1a1410',
            },
          },
          error: {
            iconTheme: {
              primary: '#E4393C',
              secondary: '#1a1410',
            },
          },
        }}
      />

      {/* Application Router */}
      <AppRouter />
    </QueryClientProvider>
  );
};

export default App;
