import { Concern, DuplicateDetectionResult } from '../types/concern';

export function checkForDuplicateConcern(
  concerns: Concern[],
  roomId: string,
  categoryId: string,
  title: string
): DuplicateDetectionResult {
  if (!roomId || concerns.length === 0) {
    return { isDuplicate: false, score: 0 };
  }

  // Filter only active, non-closed concerns
  const activeConcerns = concerns.filter(c => c.status !== 'CLOSED');

  const normalizedTitle = title.toLowerCase().trim();
  const inputWords = normalizedTitle
    .split(/\s+/)
    .filter(w => w.length > 3 && !['broken', 'damaged', 'faulty', 'with', 'this', 'that', 'from'].includes(w));

  let bestMatch: Concern | undefined;
  let highestScore = 0;
  let matchReason = '';

  for (const c of activeConcerns) {
    let score = 0;

    // 1. Exact Room Match (Crucial baseline)
    if (c.roomId === roomId) {
      score += 40;

      // 2. Same Facility Category in same room
      if (c.categoryId === categoryId && categoryId) {
        score += 35;
      }

      // 3. Keyword Title Overlap in same room
      const concernTitleWords = c.title.toLowerCase().split(/\s+/);
      const commonWords = inputWords.filter(w => concernTitleWords.some(cw => cw.includes(w) || w.includes(cw)));
      
      if (commonWords.length > 0) {
        score += Math.min(commonWords.length * 15, 30);
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = c;

      if (c.roomId === roomId && c.categoryId === categoryId) {
        matchReason = `An active report for this same room and category (${c.categoryName}) is already open.`;
      } else if (c.roomId === roomId) {
        matchReason = `An active issue is already logged in this exact location (${c.roomName}).`;
      }
    }
  }

  const isDuplicate = highestScore >= 60;

  return {
    isDuplicate,
    score: highestScore,
    matchedConcern: isDuplicate ? bestMatch : undefined,
    reason: matchReason
  };
}
