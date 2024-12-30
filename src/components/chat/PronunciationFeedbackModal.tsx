import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

interface PronunciationFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  feedback: {
    overall_score: number;
    phoneme_analysis: string;
    word_scores: { [word: string]: number };
    suggestions: string;
    NBest?: Array<{
      PronunciationAssessment: {
        AccuracyScore: number;
        FluencyScore: number;
        CompletenessScore: number;
        PronScore: number;
      };
      Words: Array<{
        Word: string;
        PronunciationAssessment: {
          AccuracyScore: number;
          ErrorType: string;
        };
      }>;
    }>;
  };
}

const PronunciationFeedbackModal: React.FC<PronunciationFeedbackModalProps> = ({
  isOpen,
  onClose,
  feedback
}) => {
  const nBestResult = feedback.NBest?.[0];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Pronunciation Assessment</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Overall Scores */}
          <div className="space-y-4">
            <h3 className="font-semibold">Overall Scores</h3>
            {nBestResult && (
              <div className="grid gap-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Accuracy</span>
                    <span className="text-sm font-medium">
                      {nBestResult.PronunciationAssessment.AccuracyScore}%
                    </span>
                  </div>
                  <Progress value={nBestResult.PronunciationAssessment.AccuracyScore} />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Fluency</span>
                    <span className="text-sm font-medium">
                      {nBestResult.PronunciationAssessment.FluencyScore}%
                    </span>
                  </div>
                  <Progress value={nBestResult.PronunciationAssessment.FluencyScore} />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Completeness</span>
                    <span className="text-sm font-medium">
                      {nBestResult.PronunciationAssessment.CompletenessScore}%
                    </span>
                  </div>
                  <Progress value={nBestResult.PronunciationAssessment.CompletenessScore} />
                </div>
              </div>
            )}
          </div>

          {/* Word-by-Word Analysis */}
          {nBestResult && (
            <div>
              <h3 className="font-semibold mb-4">Word-by-Word Analysis</h3>
              <div className="grid gap-3">
                {nBestResult.Words.map((word, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="font-medium">{word.Word}</span>
                    <div className="flex items-center gap-3">
                      <Progress 
                        value={word.PronunciationAssessment.AccuracyScore} 
                        className="w-24"
                      />
                      {word.PronunciationAssessment.ErrorType !== "None" && (
                        <span className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded-full">
                          {word.PronunciationAssessment.ErrorType}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {feedback.suggestions && (
            <div>
              <h3 className="font-semibold mb-2">Suggestions for Improvement</h3>
              <p className="text-sm text-gray-600">{feedback.suggestions}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PronunciationFeedbackModal;