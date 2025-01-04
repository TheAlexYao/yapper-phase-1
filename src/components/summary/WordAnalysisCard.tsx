import React from 'react';
import { motion } from 'framer-motion';
import { Progress } from "@/components/ui/progress";

interface WordAnalysisCardProps {
  word: {
    word: string;
    transliteration?: string;
    accuracyScore: number;
    errorType: string;
  };
}

const WordAnalysisCard: React.FC<WordAnalysisCardProps> = ({ word }) => {
  const getErrorColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'none':
        return 'bg-green-100 text-green-800';
      case 'mispronunciation':
        return 'bg-red-100 text-red-800';
      case 'omission':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex justify-between items-center p-3 rounded-lg ${
        word.errorType.toLowerCase() === 'none'
          ? 'bg-green-50'
          : word.errorType.toLowerCase() === 'omission'
          ? 'bg-yellow-50'
          : 'bg-red-50'
      }`}
    >
      <div className="flex flex-col gap-1">
        <span className="font-medium">{word.word}</span>
        {word.transliteration && (
          <span className="text-sm text-gray-600">{word.transliteration}</span>
        )}
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getErrorColor(word.errorType)}`}>
            {word.errorType}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-end">
          <span className="text-sm font-medium">
            {word.accuracyScore}%
          </span>
          <Progress 
            value={word.accuracyScore} 
            className="w-24"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default WordAnalysisCard;