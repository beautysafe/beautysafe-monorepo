export const calculateFeedbackAverage = (ratings: {
  effectivenessRating: number;
  needsRating: number;
  repurchaseRating: number;
}) =>
  (ratings.effectivenessRating +
    ratings.needsRating +
    ratings.repurchaseRating) /
  3;

export const roundRating = (value: number) => Math.round(value * 10) / 10;

export const calculateProductAverage = (
  feedback: Array<{
    effectivenessRating: number;
    needsRating: number;
    repurchaseRating: number;
  }>,
) =>
  feedback.length
    ? roundRating(
        feedback.reduce(
          (sum, item) => sum + calculateFeedbackAverage(item),
          0,
        ) / feedback.length,
      )
    : 0;
