import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

const FloatingElements = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const elements = container.getElementsByClassName('floating-element');
      
      Array.from(elements).forEach((element) => {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const deltaX = (clientX - centerX) / 50;
        const deltaY = (clientY - centerY) / 50;
        
        (element as HTMLElement).style.transform = `translate(${deltaX}px, ${deltaY}px)`;
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#38b6ff]/5 via-transparent to-[#7843e6]/5" />
      
      {/* Primary gradient blob */}
      <div className={cn(
        "floating-element absolute",
        "w-[40vw] h-[40vw] md:w-[30vw] md:h-[30vw]",
        "bg-gradient-to-r from-[#38b6ff]/10 to-[#7843e6]/10",
        "top-[-10%] right-[-10%]",
        "transform rotate-45 skew-x-12",
        "filter blur-3xl",
        "animate-float-slow"
      )} />

      {/* Secondary gradient blob */}
      <div className={cn(
        "floating-element absolute",
        "w-[45vw] h-[45vw] md:w-[35vw] md:h-[35vw]",
        "bg-gradient-to-l from-[#7843e6]/10 to-[#38b6ff]/10",
        "bottom-[-15%] left-[-15%]",
        "transform -rotate-45 skew-y-12",
        "filter blur-3xl",
        "animate-float-slower"
      )} />

      {/* Accent gradient blob */}
      <div className={cn(
        "floating-element absolute",
        "w-[30vw] h-[30vw] md:w-[25vw] md:h-[25vw]",
        "bg-gradient-to-br from-[#38b6ff]/5 to-[#7843e6]/5",
        "top-[40%] left-[30%]",
        "transform rotate-12",
        "filter blur-3xl",
        "animate-float"
      )} />
    </div>
  );
};

export default FloatingElements;