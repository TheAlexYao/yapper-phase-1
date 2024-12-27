import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSession } from "@supabase/auth-helpers-react";
import LanguageTicker from "@/components/LanguageTicker";
import FloatingElements from "@/components/FloatingElements";
import Hero from "@/components/sections/Hero";
import Features from "@/components/sections/Features";
import HowItWorks from "@/components/sections/HowItWorks";
import CTA from "@/components/sections/CTA";
import Partners from "@/components/sections/Partners";
import BetaFeatures from "@/components/sections/BetaFeatures";
import FutureVision from "@/components/sections/FutureVision";
import Testimonials from "@/components/sections/Testimonials";

const Index = () => {
  const session = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      navigate("/dashboard");
    }
  }, [session, navigate]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden overflow-y-auto">
      <FloatingElements />
      {/* Dynamic background gradients */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#38b6ff]/10 via-transparent to-[#7843e6]/10 animate-gradient-shift" />
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#38b6ff] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#7843e6] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#38b6ff] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      {/* Navigation */}
      <nav className="fixed w-full bg-background/80 backdrop-blur-sm z-50 border-b">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#38b6ff] to-[#7843e6] bg-clip-text text-transparent hover:scale-105 transition-transform cursor-pointer">
            Yapper
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#how-it-works" className="text-xl text-foreground/80 hover:text-foreground transition-colors hover:scale-105">
              How It Works
            </a>
            <a href="#features" className="text-xl text-foreground/80 hover:text-foreground transition-colors hover:scale-105">
              Features
            </a>
            <Button 
              size="lg"
              className="bg-[#7843e6] hover:bg-[#7843e6]/90 hover:scale-105 transform transition-all duration-200 shadow-[0_0_15px_rgba(120,67,230,0.3)] hover:shadow-[0_0_25px_rgba(120,67,230,0.5)] text-xl py-6 px-8"
              onClick={() => navigate('/auth')}
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      <Hero />
      <Partners />
      <LanguageTicker />
      <Features />
      <BetaFeatures />
      <FutureVision />
      <HowItWorks />
      <Testimonials />
      <CTA />

      {/* Footer */}
      <footer className="py-8 border-t relative bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-lg text-muted-foreground hover:text-foreground transition-colors">
              © 2024 Yapper. All rights reserved.
            </div>
            <div className="flex space-x-8 mt-4 md:mt-0">
              {["Privacy Policy", "Terms of Service", "Contact"].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="text-lg text-muted-foreground hover:text-foreground transition-colors hover:scale-105"
                >
                  {item}
                </a>
              ))}
            </div>
            <div className="mt-4 md:mt-0 text-sm text-muted-foreground">
              Built with <a href="https://lovable.dev/#via=alex" className="text-[#7843e6] hover:text-[#38b6ff] transition-colors">Lovable</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;