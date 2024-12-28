'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';

interface Scenario {
  id: string;
  title: string;
  description: string;
  image_url: string;
}

interface ScenarioSelectionScreenProps {
  topicTitle: string;
  onBackToTopics: () => void;
  onScenarioSelect: (scenario: Scenario) => void;
}

const ScenarioCard: React.FC<{ scenario: Scenario }> = ({ scenario }) => {
  return (
    <Card>
      <CardContent>
        <img src={scenario.image_url} alt={scenario.title} />
        <h3>{scenario.title}</h3>
        <p>{scenario.description}</p>
      </CardContent>
    </Card>
  );
};

const ScenarioSelectionScreen: React.FC<ScenarioSelectionScreenProps> = ({ topicTitle, onBackToTopics, onScenarioSelect }) => {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);

  const fetchScenarios = useCallback(async () => {
    // Fetch scenarios based on the topicTitle
    const response = await fetch(`/api/scenarios?topic=${topicTitle}`);
    const data = await response.json();
    setScenarios(data);
  }, [topicTitle]);

  useEffect(() => {
    fetchScenarios();
  }, [fetchScenarios]);

  return (
    <div className="h-screen w-screen overflow-hidden relative flex flex-col items-center justify-between">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#38b6ff]/10 via-transparent to-[#7843e6]/10 animate-gradient-shift"></div>
      </div>

      <div className="relative z-20 flex flex-col items-center justify-center w-full h-full">
        <h1 className="text-2xl font-bold">{topicTitle}</h1>
        <div className="flex flex-wrap justify-center">
          {scenarios.map((scenario) => (
            <ScenarioCard key={scenario.id} scenario={scenario} />
          ))}
        </div>
        <Button onClick={onBackToTopics} className="mt-4">
          <ArrowLeft className="mr-2" /> Back to Topics
        </Button>
      </div>
    </div>
  );
};

export default ScenarioSelectionScreen;
