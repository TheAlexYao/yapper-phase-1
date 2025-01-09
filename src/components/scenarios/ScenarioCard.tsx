import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import ScenarioProgressIndicator from './ScenarioProgressIndicator';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ScenarioCardProps {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  onClick: () => void;
  isSelected?: boolean;
}

const ScenarioCard: React.FC<ScenarioCardProps> = ({
  id,
  title,
  description,
  imageUrl,
  onClick,
  isSelected
}) => {
  // Fetch user's progress for this scenario
  const { data: progress } = useQuery({
    queryKey: ['scenarioProgress', id],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_scenarios')
        .select('*')
        .eq('scenario_id', id)
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching scenario progress:', error);
        return null;
      }

      return data;
    }
  });

  const bestScore = progress ? Math.max(
    progress.pronunciation_score,
    progress.grammar_score,
    progress.fluency_score,
    progress.vocabulary_score
  ) : null;

  const completionPercentage = progress?.status === 'completed' ? 100 : 
    progress?.attempts_count ? Math.min(Math.round((progress.attempts_count / 3) * 100), 100) : 0;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`cursor-pointer ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      onClick={onClick}
    >
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="relative">
            {imageUrl && (
              <img
                src={imageUrl}
                alt={title}
                className="w-full h-48 object-cover"
              />
            )}
            {progress?.status === 'completed' && (
              <div className="absolute top-2 right-2">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
            )}
          </div>
          
          <div className="p-4 space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{title}</h3>
              {description && (
                <p className="text-sm text-gray-500 mt-1">{description}</p>
              )}
            </div>

            <ScenarioProgressIndicator
              bestScore={bestScore}
              completionPercentage={completionPercentage}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ScenarioCard;