import { UserPlus, Target, Mic2, Trophy, MessageSquare } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: <UserPlus className="w-8 h-8" />,
      title: "Sign Up Free",
      description: "No credit card required—create an account in seconds."
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Pick a Scenario",
      description: "Choose from daily-life topics or travel-focused chats."
    },
    {
      icon: <Mic2 className="w-8 h-8" />,
      title: "Speak & Get Tips",
      description: "Record your lines and get quick feedback—no dry grammar lessons."
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: "Celebrate Your Progress",
      description: "Watch your confidence grow with every scenario completed."
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "Stay Tuned for AI Chat",
      description: "Be the first to try our upcoming real-time AI conversation feature."
    }
  ];

  return (
    <section id="how-it-works" className="py-20 px-4 bg-gradient-to-b from-background to-background/50">
      <div className="container mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 relative">
          {/* Connecting line for desktop */}
          <div className="absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-[#38b6ff] to-[#7843e6] hidden md:block" />
          
          {steps.map((step, index) => (
            <div key={index} className="relative flex flex-col items-center text-center group">
              {/* Desktop connector dots */}
              <div className="absolute top-12 left-1/2 w-4 h-4 rounded-full bg-[#38b6ff] hidden md:block 
                             transform -translate-x-1/2 -translate-y-1/2" />
              
              {/* Mobile connector line */}
              {index !== steps.length - 1 && (
                <div className="absolute left-1/2 top-24 h-12 w-0.5 bg-gradient-to-b from-[#38b6ff] to-[#7843e6] md:hidden" />
              )}
              
              <div className="w-24 h-24 rounded-xl bg-background flex items-center justify-center 
                             border-2 border-[#38b6ff] mb-6 relative z-10 group-hover:scale-110 
                             transition-transform duration-300 shadow-lg">
                <div className="text-[#38b6ff]">{step.icon}</div>
              </div>
              
              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;