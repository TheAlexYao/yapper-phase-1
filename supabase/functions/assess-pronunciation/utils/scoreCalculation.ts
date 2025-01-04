interface WeightedScores {
  accuracyScore: number;
  fluencyScore: number;
  completenessScore: number;
  pronScore: number;
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
    accuracyScore: Math.round(nBest.PronunciationAssessment.AccuracyScore),
    fluencyScore: Math.round(nBest.PronunciationAssessment.FluencyScore),
    completenessScore: Math.round(nBest.PronunciationAssessment.CompletenessScore),
    pronScore: Math.round(nBest.PronunciationAssessment.PronScore),
    finalScore: weightedScore
  };
}