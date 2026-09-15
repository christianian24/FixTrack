export type RoomType = 
  | 'Classroom'
  | 'Laboratory'
  | 'Office'
  | 'Comfort Room'
  | 'Library'
  | 'Auditorium'
  | 'Conference Room'
  | 'Workshop'
  | 'Hallway';

export interface Room {
  id: string;
  buildingId: string;
  buildingName: string;
  name: string;
  code: string;
  floor: number;
  roomType: RoomType;
  capacity?: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}
