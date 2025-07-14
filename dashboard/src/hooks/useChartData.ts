import { useQuery } from 'react-query';
import dayjs from 'dayjs';
import { FilterState } from '../ui/FilterPane';

export function useChartData(filters: FilterState) {
  return useQuery(['chart-data', filters], async () => {
    // Set default date range to last 7 days if not provided
    const start = filters.startDate || dayjs().subtract(7, 'day').format('YYYY-MM-DD');
    const end = filters.endDate || dayjs().format('YYYY-MM-DD');
    const url = new URL('/api/dashboard/chart', window.location.origin);
    url.searchParams.append('start', start);
    url.searchParams.append('end', end);
    if (filters.sku) url.searchParams.append('sku', filters.sku);
    if (filters.store) url.searchParams.append('store', filters.store);
    // Additional signal filters (if API supports)
    // ...existing code for other filters...
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error('Failed to fetch chart data');
    return res.json();
  });
}
