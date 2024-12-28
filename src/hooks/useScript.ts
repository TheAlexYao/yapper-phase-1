import { useQuery, useMutation } from '@tanstack/react-query';
import { generateScript, getScriptMessages, ScriptMessage } from '@/utils/scriptGenerator';

export const useGenerateScript = () => {
  return useMutation({
    mutationFn: async ({
      scenarioId,
      characterId,
      userGender,
      cityId
    }: {
      scenarioId: string;
      characterId: string;
      userGender: 'male' | 'female';
      cityId: string;
    }) => {
      return generateScript(scenarioId, characterId, userGender, cityId);
    }
  });
};

export const useScriptMessages = (scriptTemplateId: string | null) => {
  return useQuery({
    queryKey: ['scriptMessages', scriptTemplateId],
    queryFn: () => getScriptMessages(scriptTemplateId!),
    enabled: !!scriptTemplateId
  });
};