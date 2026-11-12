export const hasCalculatedBeautySafeScore = (
  score: number | null | undefined,
): score is number => score !== null && score !== undefined;

export const formatBeautySafeScore = (
  score: number | null | undefined,
): string =>
  hasCalculatedBeautySafeScore(score)
    ? `${score} / 100 (provisoire)`
    : "Non calculé";
