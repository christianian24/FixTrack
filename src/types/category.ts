export interface FacilityCategory {
  id: string;
  name: string;
  description: string;
  iconName: string;
  defaultPriorityHint: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'ACTIVE' | 'INACTIVE';
}
