import React from "react";
import { motion } from "framer-motion";

const AnimatedBackground = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gray-900">
      {/* Background Image with slow zoom animation */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: 1.05 }}
          transition={{ duration: 20, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/hero-bg.jpg')" }}
        />
        {/* Gradient Overlay for better readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-gray-900/60 to-gray-900/95" />
      </div>

      {/* Main Content Wrapper */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        {children}
      </div>
    </div>
  );
};

export default AnimatedBackground;
