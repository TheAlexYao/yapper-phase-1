import { Globe, Users, Brain } from "lucide-react";

const FutureVision = () => {
  const visionPoints = [
    {
      icon: <Globe className="w-8 h-8 text-[#38b6ff]" />,
      title: "ARG-Style Adventures",
      description: "Imagine exploring a new city where every conversation is a mini-quest. Coming soon: real-world challenges that make language learning an adventure."
    },
    {
      icon: <Users className="w-8 h-8 text-[#7843e6]" />,
      title: "Global Community & Meetups",
      description: "From online Language Cafés to cultural exchange groups, you won't just learn—you'll make real connections worldwide."
    },
    {
      icon: <Brain className="w-8 h-8 text-[#38b6ff]" />,
      title: "AI That Adapts to You",
      description: "Yapper learns your style and goals, crafting personalized challenges that fit your life—whether you're prepping for business trips or planning a dream vacation."
    }
  ];

  return (
    <section id="future-vision" className="py-20 px-4">
      <div className="container mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">Get Ready for a Language Adventure Like No Other</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          {visionPoints.map((point) => (
            <div key={point.title} className="p-6 rounded-xl border bg-background/50 backdrop-blur-sm hover:scale-105 transition-transform duration-300">
              <div className="mb-4">{point.icon}</div>
              <h3 className="text-2xl font-bold mb-4">{point.title}</h3>
              <p className="text-muted-foreground">{point.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FutureVision;
