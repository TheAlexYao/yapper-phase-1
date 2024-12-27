import { Mic, BookOpen, Clock, Brain } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: <Mic className="w-12 h-12 text-[#38b6ff]" />,
      title: "No More Awkward Hesitation",
      description: "Practice real-life dialogues—like ordering coffee or meeting new friends—so you stop freezing and start chatting naturally."
    },
    {
      icon: <BookOpen className="w-12 h-12 text-[#7843e6]" />,
      title: "Guided Scenarios, Real Feedback",
      description: "Jump into everyday situations and get quick, practical pointers. No stuffy textbooks, just hands-on practice."
    },
    {
      icon: <Clock className="w-12 h-12 text-[#38b6ff]" />,
      title: "Free & Easy to Start",
      description: "Sign up in seconds—no credit card required. Dive into conversation practice without any complicated setup."
    },
    {
      icon: <Brain className="w-12 h-12 text-[#7843e6]" />,
      title: "Built on Learning Research",
      description: "Our approach is backed by language acquisition experts so you'll see real progress, faster."
    }
  ];

  return (
    <section id="features" className="py-20 px-4">
      <div className="container mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">Why Yapper?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="p-8 rounded-2xl bg-background/50 backdrop-blur-sm border hover:scale-105 transition-transform duration-300"
            >
              <div className="mb-6">{feature.icon}</div>
              <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
              <p className="text-lg text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;