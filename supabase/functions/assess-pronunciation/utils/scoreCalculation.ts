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
  console.log('Calculating weighted scores with assessment:', JSON.stringify(assessment, null, 2));
  console.log('Using weights:', weights);

  // Ensure assessment has the expected structure
  if (!assessment?.NBest?.[0]?.PronunciationAssessment) {
    console.error('Invalid assessment structure:', assessment);
    return {
      accuracyScore: 0,
      fluencyScore: 0,
      completenessScore: 0,
      pronScore: 0,
      finalScore: 0
    };
  }

  const pronAssessment = assessment.NBest[0].PronunciationAssessment;
  console.log('Using pronunciation assessment:', pronAssessment);
  
  // Calculate weighted scores
  const weightedAccuracy = pronAssessment.AccuracyScore * weights.accuracyWeight;
  const weightedFluency = pronAssessment.FluencyScore * weights.fluencyWeight;
  const weightedCompleteness = pronAssessment.CompletenessScore * weights.completenessWeight;
  
  const totalWeight = weights.accuracyWeight + weights.fluencyWeight + weights.completenessWeight;
  const weightedScore = Math.round(
    (weightedAccuracy + weightedFluency + weightedCompleteness) / totalWeight
  );

  console.log('Calculated scores:', {
    accuracyScore: Math.round(pronAssessment.AccuracyScore),
    fluencyScore: Math.round(pronAssessment.FluencyScore),
    completenessScore: Math.round(pronAssessment.CompletenessScore),
    pronScore: Math.round(pronAssessment.PronScore),
    finalScore: weightedScore
  });

  return {
    accuracyScore: Math.round(pronAssessment.AccuracyScore),
    fluencyScore: Math.round(pronAssessment.FluencyScore),
    completenessScore: Math.round(pronAssessment.CompletenessScore),
    pronScore: Math.round(pronAssessment.PronScore),
    finalScore: weightedScore
  };
}