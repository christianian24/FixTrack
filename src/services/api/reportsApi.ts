const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1';

import { getToken } from './client';

export const reportsApi = {
  async downloadCsv(params?: Record<string, string>): Promise<void> {
    const qs = params
      ? '?' + new URLSearchParams(params).toString()
      : '';
    const token = getToken();
    const res = await fetch(`${BASE_URL}/reports/export/csv${qs}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('Export failed');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fixtrack_concerns_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  },
};
