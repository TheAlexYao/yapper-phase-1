import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="pt-32 pb-20 px-4 relative overflow-hidden">
      <div className="container mx-auto text-center relative">
        <h1 className="text-5xl md:text-7xl font-bold mb-8 animate-fadeIn opacity-0" style={{ animationDelay: "0.2s" }}>
          Finally Overcome the Fear of Speaking
          <span className="bg-gradient-to-r from-[#38b6ff] to-[#7843e6] bg-clip-text text-transparent block mt-2">
            in Another Language
          </span>
        </h1>
        <p className="text-2xl md:text-3xl text-muted-foreground mb-10 max-w-3xl mx-auto animate-fadeIn opacity-0" style={{ animationDelay: "0.4s" }}>
          Master everyday conversations through guided scenarios. No grammar overload, no awkward pauses—just real-life practice. Sign up free and start speaking today.
        </p>
        <div className="flex flex-col md:flex-row gap-6 justify-center items-center animate-fadeIn opacity-0" style={{ animationDelay: "0.6s" }}>
          <Button 
            size="lg"
            className="bg-[#38b6ff] hover:bg-[#38b6ff]/90 hover:scale-105 transform transition-all duration-200 shadow-[0_0_15px_rgba(56,182,255,0.3)] hover:shadow-[0_0_25px_rgba(56,182,255,0.5)] w-full md:w-auto text-xl py-6 px-8"
            onClick={() => navigate('/auth')}
          >
            Join Yapper Beta for Free
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="group hover:scale-105 transform transition-all duration-200 w-full md:w-auto text-xl py-6 px-8"
            onClick={() => navigate('/auth')}
          >
            Watch Demo
            <span className="ml-2 inline-block group-hover:translate-x-1 transition-transform">→</span>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;