import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import FloatingElements from '@/components/FloatingElements';
import { supabase } from "@/integrations/supabase/client";
import ScenarioCarousel from '@/components/scenarios/ScenarioCarousel';
import { Scenario } from "@/types/scenario";

interface ScenarioSelectionScreenProps {
  topicTitle: string;
  selectedLanguage: string;
  onBackToTopics: () => void;
  onScenarioSelect: (scenarioTitle: string, scenarioId: string) => void;
}

const ScenarioSelectionScreen: React.FC<ScenarioSelectionScreenProps> = ({
  topicTitle,
  selectedLanguage,
  onBackToTopics,
  onScenarioSelect,
}) => {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchScenarios = async () => {
    try {
      setLoading(true);
      console.log('Fetching scenarios for topic:', topicTitle);
      
      const { data: scenariosData, error: fetchError } = await supabase
        .from('default_scenarios')
        .select(`
          id,
          title,
          description,
          topic,
          image_url,
          reference_mappings!inner(uuid_id)
        `)
        .eq('topic', topicTitle);

      if (fetchError) {
        console.error('Error fetching scenarios:', fetchError);
        throw fetchError;
      }

      if (!scenariosData) {
        console.log('No scenarios found for topic:', topicTitle);
        setScenarios([]);
        return;
      }

      // Transform the data to use UUIDs
      const transformedScenarios: Scenario[] = scenariosData.map(scenario => ({
        ...scenario,
        id: scenario.reference_mappings.uuid_id
      }));

      console.log('Transformed scenarios:', transformedScenarios);
      setScenarios(transformedScenarios);
      setError(null);
    } catch (err) {
      console.error('Error in fetchScenarios:', err);
      setError('Failed to load scenarios. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScenarios();
  }, [topicTitle]);

  const handleScenarioSelect = useCallback((scenarioId: string) => {
    const selectedScenario = scenarios.find(scenario => scenario.id === scenarioId);
    if (selectedScenario) {
      onScenarioSelect(selectedScenario.title, scenarioId);
    }
  }, [scenarios, onScenarioSelect]);

  const navigate = useCallback((direction: 'prev' | 'next') => {
    setCurrentIndex(current => {
      if (direction === 'prev') {
        return current === 0 ? scenarios.length - 1 : current - 1;
      } else {
        return current === scenarios.length - 1 ? 0 : current + 1;
      }
    });
  }, [scenarios.length]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        navigate('prev');
      } else if (event.key === 'ArrowRight') {
        navigate('next');
      } else if (event.key === 'Enter') {
        const selectedScenario = scenarios[currentIndex];
        if (selectedScenario) {
          handleScenarioSelect(selectedScenario.id);
        }
      } else if (event.key === 'Backspace') {
        onBackToTopics();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, scenarios, currentIndex, handleScenarioSelect, onBackToTopics]);

  return (
    <div className="h-screen w-screen overflow-hidden relative flex flex-col items-center justify-between">
      <FloatingElements />
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#38b6ff]/10 via-transparent to-[#7843e6]/10 animate-gradient-shift"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#38b6ff] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -left-4 w-72 h-72 bg-[#7843e6] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-[#38b6ff] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-20 flex flex-col items-center justify-center w-full h-full">
        <div className="flex flex-col items-center mb-4 w-full px-4">
          <div className="w-full flex justify-between items-center mb-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-600 hover:text-gray-800"
              onClick={onBackToTopics}
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-2xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#38b6ff] to-[#7843e6]">
              {topicTitle} Scenarios
            </h1>
            <div className="w-10"></div>
          </div>
          <p className="text-lg text-gray-600 mb-4">Choose a scenario to practice</p>
        </div>

        <div className="relative flex flex-col items-center justify-center w-full max-w-sm px-4">
          {loading && (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg" role="alert">
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          )}

          {!loading && !error && scenarios.length > 0 && (
            <ScenarioCarousel
              scenarios={scenarios}
              currentIndex={currentIndex}
              onNavigate={navigate}
              onSelect={handleScenarioSelect}
            />
          )}

          {!loading && !error && scenarios.length === 0 && (
            <div className="text-center text-gray-600">
              <p>No scenarios available for this topic yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScenarioSelectionScreen;