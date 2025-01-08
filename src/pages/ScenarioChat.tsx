import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ScenarioChatScreen from '@/components/screens/ScenarioChatScreen';
import { Script, ScriptLine } from '@/types/chat';
import { LanguageCode } from '@/constants/languages';

const ScenarioChat = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [script, setScript] = useState<Script | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Extract data from location state
  const scenarioId = location.state?.scenarioId;
  const characterId = location.state?.characterId;
  const selectedLanguage = location.state?.selectedLanguage as LanguageCode;
  const scenarioTitle = location.state?.scenarioTitle;
  const characterName = location.state?.characterName;
  const topicId = location.state?.topicId;

  useEffect(() => {
    const fetchScript = async () => {
      if (!scenarioId || !characterId || !selectedLanguage) {
        setError('Missing required scenario information');
        toast({
          title: "Error",
          description: "Missing required scenario information. Please try again.",
          variant: "destructive"
        });
        return;
      }

      try {
        const { data: scriptData, error: scriptError } = await supabase
          .from('scripts')
          .select('*')
          .eq('scenario_id', scenarioId)
          .eq('character_id', characterId)
          .eq('language_code', selectedLanguage)
          .single();

        if (scriptError) throw scriptError;

        if (!scriptData) {
          throw new Error('No script found for this scenario');
        }

        // Validate script_data structure
        const rawScriptData = scriptData.script_data;
        if (
          typeof rawScriptData === 'object' && 
          rawScriptData !== null &&
          'lines' in rawScriptData &&
          Array.isArray(rawScriptData.lines) &&
          'languageCode' in rawScriptData &&
          typeof rawScriptData.languageCode === 'string'
        ) {
          // Validate each line in the array matches ScriptLine structure
          const isValidScriptLine = (line: any): line is ScriptLine => {
            return (
              typeof line === 'object' &&
              line !== null &&
              'speaker' in line &&
              (line.speaker === 'character' || line.speaker === 'user') &&
              'targetText' in line &&
              typeof line.targetText === 'string' &&
              'transliteration' in line &&
              (line.transliteration === null || typeof line.transliteration === 'string') &&
              'translation' in line &&
              typeof line.translation === 'string'
            );
          };

          // Check if all lines are valid
          if (rawScriptData.lines.every(isValidScriptLine)) {
            // Type assertion after validation
            const validatedScript: Script = {
              ...scriptData,
              script_data: {
                lines: rawScriptData.lines as ScriptLine[],
                languageCode: rawScriptData.languageCode
              }
            };
            setScript(validatedScript);
          } else {
            throw new Error('Invalid script line structure');
          }
        } else {
          throw new Error('Invalid script data structure');
        }
      } catch (err) {
        console.error('Error fetching script:', err);
        setError(err.message);
        toast({
          title: "Error",
          description: "Failed to load the conversation script. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchScript();
  }, [scenarioId, characterId, selectedLanguage, toast]);

  const handleBackToCharacters = () => {
    navigate('/characters', { 
      state: { 
        topicId,
        selectedLanguage 
      } 
    });
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={handleBackToCharacters}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Back to Characters
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <ScenarioChatScreen
      scenarioId={scenarioId}
      scenarioTitle={scenarioTitle}
      topicId={topicId}
      characterId={characterId}
      characterName={characterName}
      selectedLanguage={selectedLanguage}
      onBackToCharacters={handleBackToCharacters}
      script={script}
    />
  );
};

export default ScenarioChat;