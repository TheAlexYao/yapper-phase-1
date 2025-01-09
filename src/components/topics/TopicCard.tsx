import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { motion } from 'framer-motion';
import TopicProgressIndicator from './TopicProgressIndicator';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Topic = Database['public']['Tables']['topics']['Row'];

interface TopicCardProps {
  topic: Topic;
  onSelect: () => void;
}

const TopicCard: React.FC<TopicCardProps> = ({
  topic,
  onSelect
}) => {
  // Fetch user's progress for this topic
  const { data: progress } = useQuery({
    queryKey: ['topicProgress', topic.id],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Get all scenarios for this topic
      const { data: scenarios } = await supabase
        .from('default_scenarios')
        .select('id')
        .eq('topic', topic.title);

      if (!scenarios?.length) return null;

      // Get user's progress for all scenarios in this topic
      const { data: userScenarios } = await supabase
        .from('user_scenarios')
        .select('*')
        .eq('user_id', user.id)
        .in('scenario_id', scenarios.map(s => s.id));

      if (!userScenarios) return null;

      // Calculate completion percentage
      const completionPercentage = Math.round(
        (userScenarios.filter(s => s.status === 'completed').length / scenarios.length) * 100
      );

      // Calculate mastery level (0-5 stars) based on average scores
      const averageScores = userScenarios.reduce((acc, scenario) => {
        return acc + (
          scenario.pronunciation_score +
          scenario.grammar_score +
          scenario.fluency_score +
          scenario.vocabulary_score
        ) / 4;
      }, 0) / (userScenarios.length || 1);

      const masteryLevel = Math.min(Math.floor(averageScores / 20), 5);

      return {
        completionPercentage,
        masteryLevel
      };
    }
  });

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="cursor-pointer"
      onClick={onSelect}
    >
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="relative">
            {topic.image_url && (
              <img
                src={topic.image_url}
                alt={topic.title}
                className="w-full h-48 object-cover"
              />
            )}
          </div>
          
          <div className="p-4 space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{topic.title}</h3>
              {topic.description && (
                <p className="text-sm text-gray-500 mt-1">{topic.description}</p>
              )}
            </div>

            {progress && (
              <TopicProgressIndicator
                completionPercentage={progress.completionPercentage}
                masteryLevel={progress.masteryLevel}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TopicCard;