import './index.css';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/query-client';
import { App } from './App';

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
}
