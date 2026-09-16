import React from "react";

const AnimatedBackground = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-primary-50 via-white to-earth-50">
      {/* Background Animated Blobs */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {/* Top left blob */}
        <div className="absolute -top-[10%] -left-[10%] h-[50vw] w-[50vw] animate-blob rounded-full bg-primary-200/40 mix-blend-multiply blur-3xl filter md:h-96 md:w-96" />
        
        {/* Top right blob */}
        <div className="absolute -right-[10%] top-[20%] h-[40vw] w-[40vw] animate-blob rounded-full bg-earth-200/40 mix-blend-multiply blur-3xl filter animation-delay-2000 md:h-80 md:w-80" />
        
        {/* Bottom blob */}
        <div className="absolute -bottom-[10%] left-[20%] h-[60vw] w-[60vw] animate-blob rounded-full bg-primary-300/30 mix-blend-multiply blur-3xl filter animation-delay-4000 md:h-96 md:w-96" />

        {/* Floating Geometric Elements (hidden on very small screens to avoid clutter) */}
        <div className="hidden sm:block">
          <div className="absolute left-[10%] top-[15%] h-16 w-16 animate-float rounded-2xl border border-primary-200/50 bg-white/20 backdrop-blur-sm rotate-12" />
          <div className="absolute right-[15%] top-[10%] h-12 w-12 animate-float-reverse rounded-full border border-earth-300/50 bg-white/20 backdrop-blur-sm" />
          <div className="absolute bottom-[20%] right-[10%] h-24 w-24 animate-float rounded-3xl border border-primary-300/30 bg-white/10 backdrop-blur-md -rotate-12" />
          <div className="absolute bottom-[15%] left-[15%] h-8 w-8 animate-float-reverse rounded-lg border border-earth-400/40 bg-earth-100/30 backdrop-blur-sm rotate-45" />
        </div>
      </div>

      {/* Main Content Wrapper */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        {children}
      </div>
    </div>
  );
};

export default AnimatedBackground;
