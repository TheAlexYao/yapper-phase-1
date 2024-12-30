import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import TopicSelection from "./pages/TopicSelection";
import ScenarioSelection from "./pages/ScenarioSelection";
import CharacterSelection from "./pages/CharacterSelection";
import ScenarioChat from "./pages/ScenarioChat";

const queryClient = new QueryClient();

const App = () => {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/topics" element={<TopicSelection />} />
            <Route path="/scenarios" element={<ScenarioSelection />} />
            <Route path="/characters" element={<CharacterSelection />} />
            <Route path="/chat" element={<ScenarioChat />} />
          </Routes>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;