import { apiClient } from './client';

export interface AnalyticsSummary {
  total_concerns: number;
  open_concerns: number;
  in_progress_concerns: number;
  completed_concerns: number;
  verified_concerns: number;
  closed_concerns: number;
  rejected_concerns: number;
  by_priority: Record<string, number>;
  by_status: Record<string, number>;
  by_building: { building_id: string; building_name: string; count: number }[];
  by_category: { category_id: string; category_name: string; count: number }[];
  avg_resolution_hours: number | null;
  resolution_rate: number;
}

export const analyticsApi = {
  getSummary(): Promise<AnalyticsSummary> {
    return apiClient.get<AnalyticsSummary>('/analytics/summary');
  },
};
