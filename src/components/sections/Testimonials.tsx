const Testimonials = () => {
  const testimonials = [
    {
      quote: "I finally spoke Spanish at a local café without freezing—thanks, Yapper!",
      author: "Ava K."
    },
    {
      quote: "The guided scenarios feel so real. It's like practicing in an actual restaurant.",
      author: "Marcus J."
    }
  ];

  return (
    <section id="testimonials" className="py-20 px-4 bg-background/50">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="p-8 rounded-xl border bg-background/50 backdrop-blur-sm hover:scale-105 transition-transform duration-300"
            >
              <p className="text-xl mb-4 italic">"{testimonial.quote}"</p>
              <p className="text-right text-muted-foreground">— {testimonial.author}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
