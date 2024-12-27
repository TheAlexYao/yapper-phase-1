import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const CTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Transform Your Language Skills?</h2>
        <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto">
          Join our free Beta and see how guided scenarios can break down your speaking barriers. Real conversations, zero stress.
        </p>
        <Button 
          size="xl"
          className="bg-[#7843e6] hover:bg-[#7843e6]/90 hover:scale-105 transform transition-all duration-200 shadow-[0_0_15px_rgba(120,67,230,0.3)] hover:shadow-[0_0_25px_rgba(120,67,230,0.5)] text-xl py-6 px-8"
          onClick={() => navigate('/auth')}
        >
          Join Yapper Beta
        </Button>
        <p className="text-muted-foreground mt-4">No credit card required—start building confidence now.</p>
      </div>
    </section>
  );
};

export default CTA;