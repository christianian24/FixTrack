import { Concern } from '../types/concern';

export function exportConcernsToCSV(concerns: Concern[], filename: string = 'FacilityCare_Maintenance_Report.csv') {
  const headers = [
    'Report Number',
    'Title',
    'Category',
    'Building',
    'Room',
    'Priority',
    'Status',
    'Safety Risk',
    'Affected Users',
    'Reporter',
    'Assigned Technician',
    'Date Reported',
    'Date Completed'
  ];

  const rows = concerns.map(c => [
    `"${c.reportNumber}"`,
    `"${c.title.replace(/"/g, '""')}"`,
    `"${c.categoryName}"`,
    `"${c.buildingName}"`,
    `"${c.roomName}"`,
    `"${c.priority}"`,
    `"${c.status}"`,
    `"${c.safetyRisk}"`,
    `"${c.affectedUsers}"`,
    `"${c.reporterName}"`,
    `"${c.assignedPersonnelName || 'Unassigned'}"`,
    `"${c.createdAt.split('T')[0]}"`,
    `"${c.completedAt ? c.completedAt.split('T')[0] : 'N/A'}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
