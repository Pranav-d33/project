import { useQuery } from 'react-query';

export function useDashboardMetrics(params: {
  start_date: string;
  end_date: string;
  sku?: string;
  store?: string;
}) {
  return useQuery(['dashboard-metrics', params], async () => {
    const url = new URL('/api/dashboard/metrics', window.location.origin);
    Object.entries(params).forEach(([k, v]) => v && url.searchParams.append(k, v));
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error('Failed to fetch metrics');
    return res.json();
  });
}
