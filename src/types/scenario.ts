export interface Scenario {
  id: number; // Changed back to number to match database schema
  title: string;
  description: string | null;
  image_url: string | null;
  topic: string;
}