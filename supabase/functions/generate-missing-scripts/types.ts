export interface Language {
  code: string;
  name: string;
}

export interface Topic {
  id: string;
  title: string;
}

export interface Character {
  id: string;
  name: string;
  gender: 'male' | 'female';
  topic: string;
}

export interface Scenario {
  id: string;
  title: string;
  topic: string;
}

export interface ScriptGenerationResult {
  success: boolean;
  generated: number;
  errors: number;
  errorDetails: string[];
}