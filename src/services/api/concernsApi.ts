import { apiClient } from './client';

export interface ConcernCreateRequest {
  title: string;
  description?: string;
  category_id?: string;
  room_id?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  is_safety_hazard: boolean;
  affects_many_people: boolean;
  is_recurring?: boolean;
}

export interface ConcernRead {
  id: string;
  tracking_number: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  priority_score?: number;
  is_safety_hazard: boolean;
  affects_many_people: boolean;
  is_recurring?: boolean;
  reporter_id: string | null;
  assigned_to_id: string | null;
  category_id: string | null;
  room_id: string | null;
  submitted_at: string;
  updated_at: string;
  resolution_notes?: string | null;
  rejection_reason: string | null;
  estimated_cost?: number | null;
  assigned_at?: string | null;
  started_at?: string | null;
  completed_at: string | null;
  verified_at: string | null;
  closed_at: string | null;
  photos?: ConcernPhoto[];
  timeline_events?: TimelineEvent[];
}

export interface ConcernPhoto {
  id: string;
  url: string;
  filename: string | null;
  is_completion_photo: boolean;
  uploaded_at: string;
}

export interface TimelineEvent {
  id: string;
  event_type: string;
  old_status: string | null;
  new_status: string | null;
  note: string | null;
  created_at: string;
  actor_id: string | null;
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

  update(id: string, data: { priority?: string }): Promise<ConcernRead> {
    return apiClient.patch<ConcernRead>(`/concerns/${id}`, data);
  },

  create(data: ConcernCreateRequest): Promise<ConcernRead> {
    return apiClient.post<ConcernRead>('/concerns', data);
  },

  checkDuplicates(params: { room_id: string; category_id: string; title: string }): Promise<DuplicateWarning> {
    return apiClient.get<DuplicateWarning>('/concerns/check-duplicates', params);
  },

  assign(id: string, data: { personnel_id: string; scheduled_date?: string; notes?: string }): Promise<ConcernRead> {
    return apiClient.post<ConcernRead>(`/concerns/${id}/assign`, {
      assigned_to_id: data.personnel_id,
      note: data.notes,
    });
  },

  start(id: string, notes?: string): Promise<ConcernRead> {
    return apiClient.post<ConcernRead>(`/concerns/${id}/start`, { note: notes });
  },

  hold(id: string, reason: string): Promise<ConcernRead> {
    return apiClient.post<ConcernRead>(`/concerns/${id}/hold`, { note: reason });
  },

  complete(id: string, data: { repair_notes: string }): Promise<ConcernRead> {
    return apiClient.post<ConcernRead>(`/concerns/${id}/complete`, {
      resolution_notes: data.repair_notes,
    });
  },

  verify(id: string, notes?: string): Promise<ConcernRead> {
    return apiClient.post<ConcernRead>(`/concerns/${id}/verify`, { note: notes });
  },

  reject(id: string, reason: string): Promise<ConcernRead> {
    return apiClient.post<ConcernRead>(`/concerns/${id}/reject`, { rejection_reason: reason });
  },

  close(id: string, notes?: string): Promise<ConcernRead> {
    return apiClient.post<ConcernRead>(`/concerns/${id}/close`, { note: notes });
  },

  uploadPhoto(id: string, file: File, isCompletionPhoto = false): Promise<ConcernPhoto> {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.upload<ConcernPhoto>(
      `/uploads/photo?concern_id=${encodeURIComponent(id)}&is_completion_photo=${isCompletionPhoto}`,
      formData,
    );
  },

  deletePhoto(photoId: string): Promise<void> {
    return apiClient.delete<void>(`/uploads/photo/${encodeURIComponent(photoId)}`);
  },
};
