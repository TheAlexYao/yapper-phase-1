import { MessageSquare, Code2, Sparkles, Globe, Rocket } from "lucide-react";

const steps = [
  {
    title: "Chat with AI",
    description: "Start by describing what you want to build in natural language",
    icon: <MessageSquare className="w-12 h-12" />
  },
  {
    title: "Generate Code",
    description: "Watch as AI generates clean, maintainable code for your project",
    icon: <Code2 className="w-12 h-12" />
  },
  {
    title: "Instant Preview",
    description: "See your changes in real-time with live preview",
    icon: <Sparkles className="w-12 h-12" />
  },
  {
    title: "Customize",
    description: "Fine-tune and customize your application to perfection",
    icon: <Globe className="w-12 h-12" />
  },
  {
    title: "Deploy",
    description: "Launch your application with one click deployment",
    icon: <Rocket className="w-12 h-12" />
  }
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 px-4 bg-gradient-to-b from-background to-background/50">
      <div className="container mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 relative">
          {/* Connecting line for desktop only */}
          <div className="absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-[#38b6ff] to-[#7843e6] hidden md:block" />
          
          {steps.map((step, index) => (
            <div key={index} className="relative flex flex-col items-center text-center group">
              {/* Desktop connector dots */}
              <div className="absolute top-12 left-1/2 w-4 h-4 rounded-full bg-[#38b6ff] hidden md:block 
                             transform -translate-x-1/2 -translate-y-1/2" />
              
              {/* Mobile connector line - removed */}
              
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