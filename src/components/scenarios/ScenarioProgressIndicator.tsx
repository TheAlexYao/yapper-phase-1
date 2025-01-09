import React from 'react';
import { Progress } from "@/components/ui/progress";
import { Trophy } from 'lucide-react';

interface ScenarioProgressIndicatorProps {
  bestScore: number | null;
  completionPercentage: number;
}

const ScenarioProgressIndicator: React.FC<ScenarioProgressIndicatorProps> = ({
  bestScore,
  completionPercentage
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Progress value={completionPercentage} className="w-full" />
        {bestScore !== null && (
          <div className="flex items-center gap-1 ml-2">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium">{Math.round(bestScore)}%</span>
          </div>
        )}
      </div>
      <p className="text-xs text-gray-500">
        {completionPercentage}% Complete
      </p>
    </div>
  );
};

export default ScenarioProgressIndicator;