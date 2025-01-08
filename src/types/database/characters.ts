import { Json } from '../json';

export interface Character {
  id: string;
  name: string;
  age: number | null;
  gender: string | null;
  avatar_url: string | null;
  bio: string | null;
  language_style: string[] | null;
  created_at: string | null;
  updated_at: string | null;
  name_translations: Json | null;
  bio_translations: Json | null;
  language_style_translations: Json | null;
  localized_image_url: string | null;
  voice_id: string | null;
  topic: string;
}