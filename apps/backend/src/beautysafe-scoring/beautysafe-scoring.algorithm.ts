export const BEAUTYSAFE_VALID_INGREDIENT_SCORES = [0, 2, 3, 5, 10] as const;

export type BeautySafeIngredientScore =
  | (typeof BEAUTYSAFE_VALID_INGREDIENT_SCORES)[number]
  | 4;

export interface BeautySafeIngredientInput {
  name: string;
  score: BeautySafeIngredientScore | null;
  coef?: number;
  banned?: boolean;
}

export interface BeautySafeScoreLine {
  rank: number;
  name: string;
  score: Exclude<BeautySafeIngredientScore, 4>;
  weight: number;
  penalty: number;
  role: 'cap' | 'sets the cap' | 'deducted' | '';
}

export interface BeautySafeScoreResult {
  score: number;
  label: 'Excellent' | 'Good' | 'Poor' | 'Bad';
  start: number;
  startReason: string | null;
  totalDeducted: number;
  lines: BeautySafeScoreLine[];
  unrecognized: string[];
  recognitionRate: number;
  reliable: boolean;
}

export const BEAUTYSAFE_SCORING_PARAMS = {
  rankDecay: 0.12,
  rankFloor: 0.25,
  capScore3: 90,
  capScore5: 80,
  capsScore10: { 1: 49, 2: 24, 3: 10 },
  capBanned: 10,
  minRecognitionRate: 0.7,
} as const;

export function beautySafeRankWeight(rank: number): number {
  const { rankFloor, rankDecay } = BEAUTYSAFE_SCORING_PARAMS;
  return (
    rankFloor + (1 - rankFloor) * Math.exp(-rankDecay * (Math.max(rank, 1) - 1))
  );
}

export function normalizeBeautySafeIngredientScore(
  score: BeautySafeIngredientScore,
): Exclude<BeautySafeIngredientScore, 4> {
  const normalized = score === 4 ? 5 : score;
  if (!BEAUTYSAFE_VALID_INGREDIENT_SCORES.includes(normalized)) {
    throw new Error(`Invalid BeautySafe ingredient score: ${score}`);
  }
  return normalized;
}

function pythonRound(value: number, digits: number): number {
  const factor = 10 ** digits;
  const scaled = value * factor;
  const floor = Math.floor(scaled);
  const fraction = scaled - floor;
  const epsilon = Number.EPSILON * Math.max(1, Math.abs(scaled));

  if (Math.abs(fraction - 0.5) <= epsilon) {
    return (floor % 2 === 0 ? floor : floor + 1) / factor;
  }
  return Math.round(scaled) / factor;
}

export function calculateBeautySafeScore(
  ingredients: BeautySafeIngredientInput[],
): BeautySafeScoreResult {
  const lines: BeautySafeScoreLine[] = [];
  const unrecognized: string[] = [];

  ingredients.forEach((ingredient, index) => {
    if (ingredient.score === null) {
      unrecognized.push(ingredient.name);
      return;
    }

    const score = normalizeBeautySafeIngredientScore(ingredient.score);
    const rank = index + 1;
    const weight = beautySafeRankWeight(rank);
    lines.push({
      rank,
      name: ingredient.name,
      score,
      weight,
      penalty: score * weight * (ingredient.coef ?? 1),
      role: '',
    });
  });

  const group = (score: number) =>
    lines
      .filter((line) => line.score === score)
      .sort((a, b) => a.rank - b.rank);
  const present = Array.from(
    new Set(lines.filter((line) => line.score > 0).map((line) => line.score)),
  ).sort((a, b) => b - a);
  const top = present[0] ?? 0;

  let start = 100;
  let startReason: string | null = null;
  if (top === 10) {
    const count = group(10).length;
    const capKey = Math.min(count, 3) as 1 | 2 | 3;
    start = BEAUTYSAFE_SCORING_PARAMS.capsScore10[capKey];
    startReason = `${count} ingredient(s) scored 10`;
  } else if (top === 5) {
    start = BEAUTYSAFE_SCORING_PARAMS.capScore5;
    startReason = `${group(5).length} ingredient(s) scored 5`;
  } else if (top === 3) {
    start = BEAUTYSAFE_SCORING_PARAMS.capScore3;
    startReason = `${group(3).length} ingredient(s) scored 3`;
  }

  if (ingredients.some((ingredient) => ingredient.banned ?? false)) {
    start = Math.min(start, BEAUTYSAFE_SCORING_PARAMS.capBanned);
    startReason = 'banned ingredient';
  }

  let deducted = 0;
  for (const score of present) {
    let scoreGroup = group(score);
    if (score === top && score === 10) {
      scoreGroup.forEach((line) => {
        line.role = 'cap';
      });
      continue;
    }
    if (score === top && (score === 3 || score === 5)) {
      scoreGroup[0].role = 'sets the cap';
      scoreGroup = scoreGroup.slice(1);
    }
    scoreGroup.forEach((line) => {
      line.role = 'deducted';
      deducted += line.penalty;
    });
  }

  const finalScore = Math.floor(Math.max(0, start - deducted) + 0.5);
  const label =
    finalScore >= 75
      ? 'Excellent'
      : finalScore >= 50
        ? 'Good'
        : finalScore >= 25
          ? 'Poor'
          : 'Bad';
  const recognitionRate = ingredients.length
    ? lines.length / ingredients.length
    : 0;

  return {
    score: finalScore,
    label,
    start,
    startReason,
    totalDeducted: pythonRound(deducted, 2),
    lines,
    unrecognized,
    recognitionRate: pythonRound(recognitionRate, 2),
    reliable: recognitionRate >= BEAUTYSAFE_SCORING_PARAMS.minRecognitionRate,
  };
}
