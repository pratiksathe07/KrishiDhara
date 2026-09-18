import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const AnimatedBackground = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gray-900">
      {/* Back Button */}
      <Link
        to="/"
        className="absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/90 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-full border border-white/20 transition-all hover:scale-105 active:scale-95 shadow-lg"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      {/* Hero Background with same slow-zoom as dashboard */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: 1.06 }}
          transition={{ duration: 24, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/hero-bg.jpg')" }}
        />
        {/* Dark gradient overlay — matches dashboard */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-green-950/55 to-gray-900/85" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-16">
        {children}
      </div>
    </div>
  );
};

export default AnimatedBackground;
