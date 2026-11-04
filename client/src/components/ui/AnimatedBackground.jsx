import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCw } from "lucide-react";

const AnimatedBackground = ({ children, onRefresh }) => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-[#f3f7ff] via-[#ffffff] to-[#f8faff] text-slate-800">
      {/* Top Action Buttons */}
      <div className="absolute top-6 left-6 z-50 flex items-center gap-3">
        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white/90 hover:bg-white backdrop-blur-md rounded-full border border-slate-200/90 hover:border-[#3b38e4]/50 hover:text-[#3b38e4] transition-all hover:scale-105 active:scale-95 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-[#3b38e4]" />
          Back to Home
        </Link>

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white/90 hover:bg-white backdrop-blur-md rounded-full border border-slate-200/90 hover:border-[#3b38e4]/50 hover:text-[#3b38e4] transition-all hover:scale-105 active:scale-95 shadow-sm"
          >
            <RefreshCw className="w-4 h-4 text-[#3b38e4]" />
            Refresh
          </button>
        )}
      </div>

      {/* SapphireIQ Ambient Glow Backdrop (Light) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e0e7ff25_1px,transparent_1px),linear-gradient(to_bottom,#e0e7ff25_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

        {/* Ambient floating pastel orbs in Sapphire electric indigo, cyan and violet */}
        <motion.div
          animate={{
            x: [0, 30, 0],
            y: [0, -35, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 -left-20 w-[600px] h-[600px] rounded-full bg-[#3b38e4]/10 blur-[140px]"
        />
        <motion.div
          animate={{
            x: [0, -35, 0],
            y: [0, 40, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/3 -right-28 w-[650px] h-[650px] rounded-full bg-[#00b4d8]/10 blur-[150px]"
        />
        <motion.div
          animate={{
            x: [0, 25, 0],
            y: [0, -30, 0],
            scale: [1, 1.12, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute -bottom-32 left-1/4 w-[700px] h-[700px] rounded-full bg-[#8b5cf6]/08 blur-[160px]"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-16">
        {children}
      </div>
    </div>
  );
};

export default AnimatedBackground;
