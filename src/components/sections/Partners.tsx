import { cn } from "@/lib/utils";

const Partners = () => {
  const partners = [
    {
      name: "Google for Startups",
      logo: "/images/google-cloud.svg",
      alt: "Google for Startups Cloud Program"
    },
    {
      name: "Microsoft for Startups",
      logo: "/images/microsoft.svg",
      alt: "Microsoft for Startups Founders Hub"
    },
    {
      name: "OpenAI",
      logo: "/images/openai.svg",
      alt: "OpenAI"
    }
  ];

  return (
    <section className="py-16 px-4 bg-background/50 backdrop-blur-sm">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-bold mb-8">Developed with the Support of Industry Leaders</h2>
        <div className="flex flex-wrap justify-center items-center gap-12">
          {partners.map((partner) => (
            <div
              key={partner.name}
              className={cn(
                "w-40 h-20 relative grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300",
                "flex items-center justify-center"
              )}
            >
              <img
                src={partner.logo}
                alt={partner.alt}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ))}
        </div>
        <p className="text-muted-foreground mt-8 max-w-2xl mx-auto">
          These partnerships allow us to innovate quickly and deliver a truly immersive speaking experience.
        </p>
      </div>
    </section>
  );
};

export default Partners;