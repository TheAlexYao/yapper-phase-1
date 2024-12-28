import React from 'react';
import { Info } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserMessage } from '@/types/chat';

interface FeedbackModalProps {
  feedback: UserMessage['feedback'];
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ feedback }) => {
  if (!feedback || !feedback.NBest || feedback.NBest.length === 0) {
    return null;
  }

  const nBest = feedback.NBest[0];
  const pronAssessment = nBest.PronunciationAssessment;
  const words = nBest.Words || [];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="mt-2 hover:bg-opacity-80 transition-colors duration-200">
          <Info className="h-4 w-4 mr-2" />
          Score: {pronAssessment.PronScore}%
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white border shadow-lg">
        <DialogHeader>
          <DialogTitle>Pronunciation Feedback</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="mb-2 font-semibold">Accuracy</h4>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${pronAssessment.AccuracyScore}%` }}></div>
              </div>
              <p className="mt-1 text-sm">{pronAssessment.AccuracyScore}%</p>
            </div>
            <div>
              <h4 className="mb-2 font-semibold">Fluency</h4>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${pronAssessment.FluencyScore}%` }}></div>
              </div>
              <p className="mt-1 text-sm">{pronAssessment.FluencyScore}%</p>
            </div>
          </div>
          <div>
            <h4 className="mb-2 font-semibold">Word Analysis:</h4>
            <ul className="grid gap-2">
              {words.map((word, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span className="text-sm">{word.Word}:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${word.PronunciationAssessment.AccuracyScore}%` }}></div>
                    </div>
                    {word.PronunciationAssessment.ErrorType !== 'none' && (
                      <span className="text-xs text-destructive">{word.PronunciationAssessment.ErrorType}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackModal;