import { Json } from '../json';

export interface ChatSession {
  id: string;
  scenario_id: string;
  character_id: string;
  user_id: string;
  messages: Json;
  current_line_index: number;
  created_at: string;
  updated_at: string;
}