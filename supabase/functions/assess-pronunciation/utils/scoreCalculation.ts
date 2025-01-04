interface WeightedScores {
  accuracyScore: number;
  fluencyScore: number;
  completenessScore: number;
  finalScore: number;
}

export function calculateWeightedScores(
  assessment: any,
  weights: { accuracyWeight: number; fluencyWeight: number; completenessWeight: number }
): WeightedScores {
  const nBest = assessment.NBest[0];
  const weightedAccuracy = nBest.PronunciationAssessment.AccuracyScore * weights.accuracyWeight;
  const weightedFluency = nBest.PronunciationAssessment.FluencyScore * weights.fluencyWeight;
  const weightedCompleteness = nBest.PronunciationAssessment.CompletenessScore * weights.completenessWeight;
  
  const totalWeight = weights.accuracyWeight + weights.fluencyWeight + weights.completenessWeight;
  const weightedScore = Math.round(
    (weightedAccuracy + weightedFluency + weightedCompleteness) / totalWeight
  );

  return {
    accuracyScore: Math.round(weightedAccuracy / weights.accuracyWeight),
    fluencyScore: Math.round(weightedFluency / weights.fluencyWeight),
    completenessScore: Math.round(weightedCompleteness / weights.completenessWeight),
    finalScore: weightedScore
  };
}