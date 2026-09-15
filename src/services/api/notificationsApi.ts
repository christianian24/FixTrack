import { apiClient } from './client';

export interface NotificationRead {
  id: string;
  title: string;
  message: string;
  type: string;
  concern_id: string | null;
  report_number: string | null;
  read: boolean;
  created_at: string;
}

export const notificationsApi = {
  list(): Promise<NotificationRead[]> {
    return apiClient.get<NotificationRead[]>('/notifications');
  },

  markRead(id: string): Promise<NotificationRead> {
    return apiClient.patch<NotificationRead>(`/notifications/${id}/read`);
  },

  markAllRead(): Promise<{ updated: number }> {
    return apiClient.post<{ updated: number }>('/notifications/mark-all-read');
  },
};
