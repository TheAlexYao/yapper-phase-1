import { Json } from '../json';
import { ChatMessage } from '../chat';

export interface ChatSession {
  id: string;
  scenario_id: string;
  character_id: string;
  user_id: string;
  messages: ChatMessage[];
  current_line_index: number;
  created_at: string;
  updated_at: string;
}

export interface ChatSessionInsert extends Omit<ChatSession, 'id' | 'created_at' | 'updated_at'> {}
export interface ChatSessionUpdate extends Partial<ChatSessionInsert> {}