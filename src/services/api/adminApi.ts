import { apiClient } from './client';

export interface BuildingRead {
  id: string;
  name: string;
  code: string;
  floors: number;
  description: string | null;
  status: string;
  total_rooms: number;
}

export interface RoomRead {
  id: string;
  building_id: string;
  building_name: string;
  name: string;
  code: string;
  floor: number;
  room_type: string;
  capacity: number;
  status: string;
}

export interface CategoryRead {
  id: string;
  name: string;
  description: string | null;
  icon_name: string | null;
  default_priority_hint: string | null;
  status: string;
}

export interface UserRead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  user_type: string;
  department: string | null;
  phone: string | null;
  avatar_url: string | null;
  status: string;
  created_at: string;
}

// ─── Buildings ────────────────────────────────────────────────────────────────
export const buildingsApi = {
  list(): Promise<BuildingRead[]> {
    return apiClient.get<BuildingRead[]>('/buildings');
  },
  get(id: string): Promise<BuildingRead> {
    return apiClient.get<BuildingRead>(`/buildings/${id}`);
  },
  create(data: Omit<BuildingRead, 'id' | 'status' | 'total_rooms'>): Promise<BuildingRead> {
    return apiClient.post<BuildingRead>('/buildings', data);
  },
  update(id: string, data: Partial<BuildingRead>): Promise<BuildingRead> {
    return apiClient.patch<BuildingRead>(`/buildings/${id}`, data);
  },
  remove(id: string): Promise<void> {
    return apiClient.delete(`/buildings/${id}`);
  },
};

// ─── Rooms ────────────────────────────────────────────────────────────────────
export const roomsApi = {
  list(buildingId?: string): Promise<RoomRead[]> {
    return apiClient.get<RoomRead[]>('/rooms', buildingId ? { building_id: buildingId } : undefined);
  },
  get(id: string): Promise<RoomRead> {
    return apiClient.get<RoomRead>(`/rooms/${id}`);
  },
  create(data: Omit<RoomRead, 'id' | 'status' | 'building_name'>): Promise<RoomRead> {
    return apiClient.post<RoomRead>('/rooms', data);
  },
  update(id: string, data: Partial<RoomRead>): Promise<RoomRead> {
    return apiClient.patch<RoomRead>(`/rooms/${id}`, data);
  },
  remove(id: string): Promise<void> {
    return apiClient.delete(`/rooms/${id}`);
  },
};

// ─── Categories ───────────────────────────────────────────────────────────────
export const categoriesApi = {
  list(): Promise<CategoryRead[]> {
    return apiClient.get<CategoryRead[]>('/categories');
  },
  get(id: string): Promise<CategoryRead> {
    return apiClient.get<CategoryRead>(`/categories/${id}`);
  },
  create(data: Omit<CategoryRead, 'id' | 'status'>): Promise<CategoryRead> {
    return apiClient.post<CategoryRead>('/categories', data);
  },
  update(id: string, data: Partial<CategoryRead>): Promise<CategoryRead> {
    return apiClient.patch<CategoryRead>(`/categories/${id}`, data);
  },
  remove(id: string): Promise<void> {
    return apiClient.delete(`/categories/${id}`);
  },
};

// ─── Users ────────────────────────────────────────────────────────────────────
export const usersApi = {
  list(): Promise<UserRead[]> {
    return apiClient.get<UserRead[]>('/users');
  },
  get(id: string): Promise<UserRead> {
    return apiClient.get<UserRead>(`/users/${id}`);
  },
  updateMe(data: Partial<Pick<UserRead, 'first_name' | 'last_name' | 'phone' | 'department'>>): Promise<UserRead> {
    return apiClient.patch<UserRead>('/users/me', data);
  },
  update(id: string, data: Partial<UserRead>): Promise<UserRead> {
    return apiClient.patch<UserRead>(`/users/${id}`, data);
  },
};
