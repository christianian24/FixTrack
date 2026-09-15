import { apiClient } from './client';

export interface ConcernCreateRequest {
  title: string;
  description: string;
  category_id: string;
  building_id: string;
  room_id: string;
  safety_risk: boolean;
  affected_users: number;
  priority?: string;
}

export interface ConcernRead {
  id: string;
  report_number: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  safety_risk: boolean;
  affected_users: number;
  reporter_id: string;
  reporter_name: string;
  category_id: string;
  category_name: string;
  building_id: string;
  building_name: string;
  room_id: string;
  room_name: string;
  assigned_personnel_id: string | null;
  assigned_personnel_name: string | null;
  repair_notes: string | null;
  rejection_reason: string | null;
  completed_at: string | null;
  verified_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
  photos: ConcernPhoto[];
  timeline: TimelineEvent[];
}

export interface ConcernPhoto {
  id: string;
  concern_id: string;
  photo_url: string;
  photo_type: 'BEFORE' | 'DURING' | 'AFTER';
  caption: string | null;
}

export interface TimelineEvent {
  id: string;
  actor_id: string;
  actor_name: string;
  action: string;
  notes: string | null;
  status_before: string | null;
  status_after: string | null;
  created_at: string;
}

export interface DuplicateWarning {
  has_duplicates: boolean;
  duplicates: { id: string; report_number: string; title: string; status: string }[];
}

export interface ListParams {
  skip?: number;
  limit?: number;
  status?: string;
  priority?: string;
  building_id?: string;
  category_id?: string;
  assigned_to?: string;
  search?: string;
}

export const concernsApi = {
  list(params?: ListParams): Promise<ConcernRead[]> {
    return apiClient.get<ConcernRead[]>('/concerns', params as Record<string, string>);
  },

  get(id: string): Promise<ConcernRead> {
    return apiClient.get<ConcernRead>(`/concerns/${id}`);
  },

  create(data: ConcernCreateRequest): Promise<ConcernRead> {
    return apiClient.post<ConcernRead>('/concerns', data);
  },

  checkDuplicates(params: { room_id: string; category_id: string; title: string }): Promise<DuplicateWarning> {
    return apiClient.get<DuplicateWarning>('/concerns/check-duplicates', params);
  },

  assign(id: string, data: { personnel_id: string; scheduled_date?: string; notes?: string }): Promise<ConcernRead> {
    return apiClient.post<ConcernRead>(`/concerns/${id}/assign`, data);
  },

  start(id: string, notes?: string): Promise<ConcernRead> {
    return apiClient.post<ConcernRead>(`/concerns/${id}/start`, { notes });
  },

  hold(id: string, reason: string): Promise<ConcernRead> {
    return apiClient.post<ConcernRead>(`/concerns/${id}/hold`, { reason });
  },

  complete(id: string, data: { repair_notes: string }): Promise<ConcernRead> {
    return apiClient.post<ConcernRead>(`/concerns/${id}/complete`, data);
  },

  verify(id: string, notes?: string): Promise<ConcernRead> {
    return apiClient.post<ConcernRead>(`/concerns/${id}/verify`, { notes });
  },

  reject(id: string, reason: string): Promise<ConcernRead> {
    return apiClient.post<ConcernRead>(`/concerns/${id}/reject`, { reason });
  },

  close(id: string, notes?: string): Promise<ConcernRead> {
    return apiClient.post<ConcernRead>(`/concerns/${id}/close`, { notes });
  },
};
