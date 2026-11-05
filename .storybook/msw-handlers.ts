import { http, HttpResponse, delay } from 'msw';

/**
 * Alert Center uses in-memory mocks via React Query (alert-api.ts).
 * These handlers are placeholders for future REST API integration.
 */
export const mswHandlers = {
  alerts: [
    http.get('/api/alerts', async () => {
      await delay(300);
      return HttpResponse.json([]);
    }),
    http.get('/api/alerts/kpis', async () => {
      await delay(200);
      return HttpResponse.json({ critical: 0, high: 0, medium: 0 });
    }),
  ],
};
