import { ConcernPriority, SafetyRisk, AffectedUsers, PriorityRecommendationResult } from '../types/concern';

export function calculateRecommendedPriority(
  safetyRisk: SafetyRisk,
  affectedUsers: AffectedUsers,
  categoryId: string,
  categoryName: string,
  existingDuplicatesCount: number = 0
): PriorityRecommendationResult {
  let score = 0;
  const reasons: string[] = [];

  // 1. Safety Risk Evaluation
  switch (safetyRisk) {
    case 'IMMEDIATE_DANGER':
      score += 50;
      reasons.push('Immediate life safety hazard detected (fire, live voltage, toxic fumes, or structural collapse risk)');
      break;
    case 'SIGNIFICANT':
      score += 30;
      reasons.push('Significant safety risk (slipping hazard, sharp fractured materials, or falling debris)');
      break;
    case 'MINOR':
      score += 10;
      reasons.push('Minor safety inconvenience with localized risk');
      break;
    case 'NONE':
      // No extra points
      break;
  }

  // 2. Affected Users Evaluation
  switch (affectedUsers) {
    case 'CAMPUS_WIDE':
      score += 35;
      reasons.push('Campus-wide impact: Affects large student/faculty population or central facility');
      break;
    case 'FLOOR':
      score += 25;
      reasons.push('Floor-level impact: Impedes access or utilities for multiple rooms and corridors');
      break;
    case 'CLASS':
      score += 15;
      reasons.push('Classroom impact: Directly disrupts instructional session of 30–60 students');
      break;
    case 'INDIVIDUAL':
      score += 5;
      reasons.push('Isolated impact: Primarily affects individual desk or workstation');
      break;
  }

  // 3. Facility Category Hazard Weight
  const highRiskCategories = ['cat-electrical', 'cat-lab'];
  const mediumRiskCategories = ['cat-plumbing', 'cat-doors', 'cat-windows', 'cat-cr'];

  if (highRiskCategories.includes(categoryId)) {
    score += 25;
    reasons.push(`High-hazard facility system: ${categoryName} requires prompt technical containment`);
  } else if (mediumRiskCategories.includes(categoryId)) {
    score += 15;
    reasons.push(`Essential utility system: ${categoryName} failure impairs sanitary/structural facility integrity`);
  }

  // 4. Duplicate / Recurring Report Weight
  if (existingDuplicatesCount > 0) {
    const dupBonus = Math.min(existingDuplicatesCount * 10, 20);
    score += dupBonus;
    reasons.push(`${existingDuplicatesCount} similar report(s) previously logged for this room, indicating recurring/unresolved issue`);
  }

  // Final Priority Determination
  let recommendedPriority: ConcernPriority = 'LOW';
  if (score >= 65 || safetyRisk === 'IMMEDIATE_DANGER') {
    recommendedPriority = 'CRITICAL';
  } else if (score >= 40) {
    recommendedPriority = 'HIGH';
  } else if (score >= 20) {
    recommendedPriority = 'MEDIUM';
  } else {
    recommendedPriority = 'LOW';
  }

  if (reasons.length === 0) {
    reasons.push('Standard non-hazardous routine maintenance request');
  }

  return {
    recommendedPriority,
    reasons
  };
}
