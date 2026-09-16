import { apiClient } from './client';

export interface NotificationRead {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  concern_id: string | null;
  is_read: boolean;
  created_at: string;
}

export const notificationsApi = {
  list(): Promise<NotificationRead[]> {
    return apiClient.get<NotificationRead[]>('/notifications');
  },

  markRead(id: string): Promise<NotificationRead> {
    return apiClient.post<NotificationRead>(`/notifications/${id}/read`);
  },

  markAllRead(): Promise<{ updated: number }> {
    return apiClient.post<{ updated: number }>('/notifications/read-all');
  },
};
