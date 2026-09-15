export interface Building {
  id: string;
  name: string;
  code: string;
  floors: number;
  totalRooms: number;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}
