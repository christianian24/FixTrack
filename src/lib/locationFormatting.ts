import { Concern } from '../types/concern';

export function formatBuildingLabel(buildingName: string, buildingCode?: string): string {
  return buildingCode ? `${buildingName} (${buildingCode})` : buildingName;
}

export function formatConcernRoom(concern: Concern): string {
  const otherLocation = concern.otherLocation?.trim();
  if (otherLocation) return otherLocation;

  if (concern.roomId && concern.roomFloor !== undefined && concern.roomFloor !== null) {
    return `${concern.roomName} (Floor ${concern.roomFloor})`;
  }

  return concern.roomName;
}

export function formatConcernLocation(concern: Concern): string {
  return `${formatBuildingLabel(concern.buildingName, concern.buildingCode)} · ${formatConcernRoom(concern)}`;
}
