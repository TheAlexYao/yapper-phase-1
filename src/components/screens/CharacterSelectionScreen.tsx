'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import FloatingElements from '@/components/FloatingElements';
import { supabase } from "@/integrations/supabase/client";
import CharacterCarousel from '../character-selection/CharacterCarousel';

interface Character {
  id: string;
  name: string;
  bio: string | null;
  avatar_url: string | null;
  gender: string | null;
}

interface CharacterSelectionScreenProps {
  scenarioTitle: string;
  selectedLanguage: string;
  onBackToScenarios: () => void;
  onCharacterSelect: (characterId: string, characterName: string) => void;
}

const CharacterSelectionScreen: React.FC<CharacterSelectionScreenProps> = ({
  scenarioTitle,
  selectedLanguage,
  onBackToScenarios,
  onCharacterSelect,
}) => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchCharacters = async () => {
    try {
      setLoading(true);
      // First, get the scenario ID based on the title
      const { data: scenarios, error: scenarioError } = await supabase
        .from('default_scenarios')
        .select('id')
        .ilike('title', `%${scenarioTitle}%`)
        .limit(1)
        .maybeSingle();

      if (scenarioError) throw scenarioError;
      if (!scenarios) {
        throw new Error('Scenario not found');
      }

      // Convert the numeric ID to a UUID format that matches our data
      const scenarioUuid = crypto.randomUUID();
      console.log('Fetching characters for scenario:', scenarioUuid);

      // Then, get the characters for this scenario
      const { data, error: fetchError } = await supabase
        .from('characters')
        .select('*')
        .eq('scenario_id', scenarioUuid)
        .order('gender', { ascending: false }); // This will put 'female' first since 'f' comes before 'm'

      if (fetchError) throw fetchError;

      if (data) {
        setCharacters(data);
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching characters:', err);
      setError('Failed to load conversation partners. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharacters();
  }, [scenarioTitle]);

  const navigate = useCallback((direction: 'prev' | 'next') => {
    setCurrentIndex(current => {
      if (direction === 'prev') {
        return current === 0 ? characters.length - 1 : current - 1;
      } else {
        return current === characters.length - 1 ? 0 : current + 1;
      }
    });
  }, [characters.length]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        navigate('prev');
      } else if (event.key === 'ArrowRight') {
        navigate('next');
      } else if (event.key === 'Enter') {
        const selectedCharacter = characters[currentIndex];
        if (selectedCharacter) {
          onCharacterSelect(selectedCharacter.id, selectedCharacter.name);
        }
      } else if (event.key === 'Backspace') {
        onBackToScenarios();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, characters, currentIndex, onCharacterSelect, onBackToScenarios]);

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
              onClick={onBackToScenarios}
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-2xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#38b6ff] to-[#7843e6]">
              Choose Your Partner
            </h1>
            <div className="w-10"></div>
          </div>
          <p className="text-lg text-gray-600 mb-4">Select a conversation partner for: {scenarioTitle}</p>
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

          {!loading && !error && characters.length > 0 && (
            <CharacterCarousel
              characters={characters}
              currentIndex={currentIndex}
              onNavigate={navigate}
              onSelect={onCharacterSelect}
            />
          )}

          {!loading && !error && characters.length === 0 && (
            <div className="text-center text-gray-600">
              <p>No conversation partners available for this scenario yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CharacterSelectionScreen;