import React from 'react';
import { ScriptMessage } from '@/utils/scriptGenerator';
import { Card } from '@/components/ui/card';

interface ScriptDisplayProps {
  messages: ScriptMessage[];
  isLoading?: boolean;
}

const ScriptDisplay = ({ messages, isLoading }: ScriptDisplayProps) => {
  if (isLoading) {
    return <div>Loading script...</div>;
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <Card key={message.id} className="p-4">
          <div className="flex flex-col space-y-2">
            <div className="text-sm font-medium text-gray-500">
              {message.speaker === 'character' ? 'Character' : 'You'}
            </div>
            <div className="text-lg">{message.content}</div>
            {message.transliteration && (
              <div className="text-sm text-gray-600">{message.transliteration}</div>
            )}
            {message.translation && (
              <div className="text-sm text-gray-500">{message.translation}</div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ScriptDisplay;