import { MatchResult } from './api-clients';
import { CONFIRMATION_THRESHOLD } from './config';

export class ResultValidator {
  validateResults(results: MatchResult[]): MatchResult | null {
    if (results.length < CONFIRMATION_THRESHOLD) {
      console.log(`Not enough results to validate. Need ${CONFIRMATION_THRESHOLD}, got ${results.length}`);
      return null;
    }

    // Group results by their scores
    const scoreGroups = results.reduce((acc, result) => {
      const key = `${result.homeScore}-${result.awayScore}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(result);
      return acc;
    }, {} as Record<string, MatchResult[]>);

    // Find the score that appears most frequently
    let mostFrequentScore: string | null = null;
    let maxCount = 0;

    for (const [score, group] of Object.entries(scoreGroups)) {
      if (group.length > maxCount) {
        maxCount = group.length;
        mostFrequentScore = score;
      }
    }

    // Check if we have enough confirmations
    if (maxCount < CONFIRMATION_THRESHOLD) {
      console.log(`No score has enough confirmations. Need ${CONFIRMATION_THRESHOLD}, max got ${maxCount}`);
      return null;
    }

    // Return the first result with the most frequent score
    return scoreGroups[mostFrequentScore!][0];
  }

  getResult(result: MatchResult): number {
    if (result.homeScore > result.awayScore) return 1; // HOME_WIN
    if (result.homeScore < result.awayScore) return 2; // AWAY_WIN
    return 3; // DRAW
  }
}
