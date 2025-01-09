import React from 'react';
import { Progress } from "@/components/ui/progress";
import { Trophy, Star } from 'lucide-react';

interface TopicProgressIndicatorProps {
  completionPercentage: number;
  masteryLevel: number;  // 0-5 stars
}

const TopicProgressIndicator: React.FC<TopicProgressIndicatorProps> = ({
  completionPercentage,
  masteryLevel
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Progress value={completionPercentage} className="w-full" />
        <div className="flex items-center gap-1 ml-2">
          <Trophy className="h-4 w-4 text-yellow-500" />
          <div className="flex">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                className={`h-3 w-3 ${
                  index < masteryLevel 
                    ? 'text-yellow-500 fill-yellow-500' 
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-500">
        {completionPercentage}% Complete
      </p>
    </div>
  );
};

export default TopicProgressIndicator;