export interface Scenario {
  id: string; // Changed to string to handle UUID
  title: string;
  description: string | null;
  image_url: string | null;
  topic: string;
}