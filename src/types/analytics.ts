export interface TechnicianPerformance {
  personnelId: string;
  name: string;
  assigned: number;
  completed: number;
  inProgress: number;
  avgCompletionHours: number;
  completionRate: number; // percentage
}

export interface BuildingConcernStat {
  buildingId: string;
  buildingName: string;
  totalConcerns: number;
  resolvedConcerns: number;
  criticalConcerns: number;
}

export interface CategoryConcernStat {
  categoryId: string;
  categoryName: string;
  count: number;
  percentage: number;
}

export interface MonthlyTrend {
  month: string;
  reported: number;
  resolved: number;
}

export interface SystemOverviewStats {
  totalConcerns: number;
  pendingReports: number;
  underReview: number;
  assignedRepairs: number;
  inProgressRepairs: number;
  waitingForMaterials: number;
  completedRepairs: number;
  closedRequests: number;
  criticalConcerns: number;
  avgRepairHours: number;
  overallCompletionRate: number;
  mostReportedBuilding: string;
  mostCommonIssue: string;
}
