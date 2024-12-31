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
        Offset?: number;
        Duration?: number;
        PronunciationAssessment: {
          AccuracyScore: number;
          ErrorType: string;
        };
      }>;
    }>;
  };
}

const ErrorTypeBadge = ({ errorType }: { errorType: string }) => {
  const getErrorColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'none':
        return 'bg-green-100 text-green-800';
      case 'mispronunciation':
        return 'bg-red-100 text-red-800';
      case 'omission':
        return 'bg-yellow-100 text-yellow-800';
      case 'noassessment':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getErrorColor(errorType)}`}>
      {errorType}
    </span>
  );
};

const PronunciationFeedbackModal: React.FC<PronunciationFeedbackModalProps> = ({
  isOpen,
  onClose,
  feedback
}) => {
  const nBestResult = feedback.NBest?.[0];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Pronunciation Assessment</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4 flex-1 overflow-y-auto">
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
          {nBestResult && nBestResult.Words && nBestResult.Words.length > 0 && (
            <div>
              <h3 className="font-semibold mb-4">Word-by-Word Analysis</h3>
              <div className="grid gap-3">
                {nBestResult.Words.map((word, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      word.PronunciationAssessment.ErrorType.toLowerCase() === 'none'
                        ? 'bg-green-50'
                        : word.PronunciationAssessment.ErrorType.toLowerCase() === 'omission'
                        ? 'bg-yellow-50'
                        : 'bg-red-50'
                    }`}
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{word.Word}</span>
                      <div className="flex items-center gap-2">
                        <ErrorTypeBadge errorType={word.PronunciationAssessment.ErrorType} />
                        {word.Duration !== undefined && (
                          <span className="text-xs text-gray-500">
                            Duration: {(word.Duration / 1000000).toFixed(2)}s
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-medium">
                          {word.PronunciationAssessment.AccuracyScore}%
                        </span>
                        <Progress 
                          value={word.PronunciationAssessment.AccuracyScore} 
                          className="w-24"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {feedback.suggestions && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Suggestions for Improvement</h3>
              <p className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
                {feedback.suggestions}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PronunciationFeedbackModal;