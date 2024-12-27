import { Mic2, MessageSquare, Zap, Bot } from "lucide-react";

const BetaFeatures = () => {
  const features = [
    {
      icon: <Mic2 className="w-8 h-8" />,
      title: "Guided Scenarios",
      description: "Select everyday conversations—like traveling, dining, or socializing—and practice lines to build confidence fast.",
      status: "Live in Beta"
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "Immediate Feedback",
      description: "Hear how you can improve your pronunciation and clarity without burying you in grammar rules.",
      status: "Live in Beta"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "No Cost to Try",
      description: "Our beta is free. Jump in now and be among the first to shape Yapper's future.",
      status: "Live in Beta"
    },
    {
      icon: <Bot className="w-8 h-8" />,
      title: "Real-Time AI Chat",
      description: "Soon, you'll speak freely with an adaptive AI that responds like a real conversation partner.",
      status: "Coming Soon"
    }
  ];

  return (
    <section id="beta-features" className="py-20 px-4 bg-background/50">
      <div className="container mx-auto">
        <h2 className="text-4xl font-bold text-center mb-16">What You Get Today</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature) => (
            <div key={feature.title} className="p-6 rounded-xl border bg-background/50 backdrop-blur-sm hover:scale-105 transition-transform duration-300">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-[#38b6ff]/10">
                  {feature.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      feature.status === "Live in Beta" 
                        ? "bg-[#38b6ff]/10 text-[#38b6ff]" 
                        : "bg-[#7843e6]/10 text-[#7843e6]"
                    }`}>
                      {feature.status}
                    </span>
                  </div>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BetaFeatures;
