import React from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PostScenarioSummaryProps {
  scenarioTitle: string;
  overallScore: number;
  transcript: Array<{
    role: 'bot' | 'user';
    text: string;
    audioUrl?: string;
    ttsUrl: string;
    score?: number;
  }>;
  detailedScores: {
    accuracyScore: number;
    fluencyScore: number;
    completenessScore: number;
    pronScore: number;
  };
  wordLevelFeedback: Array<{
    word: string;
    accuracyScore: number;
    errorType: string;
  }>;
  progressData: Array<{
    date: string;
    score: number;
  }>;
  onRestart: () => void;
  onExit: () => void;
  onNextScenario: () => void;
}

const PostScenarioSummary: React.FC<PostScenarioSummaryProps> = ({
  scenarioTitle,
  overallScore,
  transcript,
  detailedScores,
  wordLevelFeedback,
  progressData,
  onRestart,
  onExit,
  onNextScenario,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#38b6ff]/10 via-transparent to-[#7843e6]/10 p-6">
      <Card className="max-w-4xl mx-auto bg-white/80 backdrop-blur p-6 shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">{scenarioTitle} - Summary</h1>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold mb-4">Overall Performance</h2>
            <div className="bg-gradient-to-r from-[#38b6ff] to-[#7843e6] text-white rounded-lg p-4 mb-4">
              <p className="text-3xl font-bold text-center">{Math.round(overallScore)}%</p>
            </div>
            
            <h3 className="text-lg font-semibold mb-2">Detailed Scores</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Accuracy:</span>
                <span>{detailedScores.accuracyScore}%</span>
              </div>
              <div className="flex justify-between">
                <span>Fluency:</span>
                <span>{detailedScores.fluencyScore}%</span>
              </div>
              <div className="flex justify-between">
                <span>Completeness:</span>
                <span>{detailedScores.completenessScore}%</span>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Progress Chart</h2>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#38b6ff" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Word-Level Analysis</h2>
          <div className="grid gap-2">
            {wordLevelFeedback.map((word, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <span>{word.word}</span>
                <div className="flex items-center gap-4">
                  <span>{word.accuracyScore}%</span>
                  {word.errorType !== 'none' && (
                    <span className="text-red-500 text-sm">{word.errorType}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Conversation Transcript</h2>
          <div className="space-y-4">
            {transcript.map((entry, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg ${
                  entry.role === 'bot'
                    ? 'bg-gradient-to-r from-[#38b6ff] to-[#7843e6] text-white ml-auto'
                    : 'bg-white border'
                }`}
              >
                <p>{entry.text}</p>
                {entry.score && (
                  <p className="text-sm opacity-75 mt-1">Score: {entry.score}%</p>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-8 flex justify-center gap-4">
          <Button onClick={onExit} variant="outline">
            Exit
          </Button>
          <Button onClick={onRestart}>
            Try Again
          </Button>
          <Button onClick={onNextScenario} className="bg-gradient-to-r from-[#38b6ff] to-[#7843e6]">
            Next Scenario
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default PostScenarioSummary;