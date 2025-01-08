export interface Scenario {
  id: string; // Changed from number to UUID string
  title: string;
  description: string | null;
  image_url: string | null;
  topic: string;
}