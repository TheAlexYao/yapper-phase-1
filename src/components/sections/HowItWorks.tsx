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
        <div className="relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-[#38b6ff] to-[#7843e6] hidden md:block" />
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center border-2 border-[#38b6ff] mb-6 relative z-10">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;