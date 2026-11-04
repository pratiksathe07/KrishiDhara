import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export const Unauthorized = () => (
  <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#f8faff] p-4 text-slate-800">
    {/* SapphireIQ Ambient Glow Backdrop (Light) */}
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e0e7ff25_1px,transparent_1px),linear-gradient(to_bottom,#e0e7ff25_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      <motion.div
        animate={{ x: [0, 25, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-32 -left-20 w-[550px] h-[550px] rounded-full bg-[#3b38e4]/08 blur-[130px]"
      />
      <motion.div
        animate={{ x: [0, -30, 0], y: [0, 35, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-1/4 -right-24 w-[600px] h-[600px] rounded-full bg-[#00b4d8]/08 blur-[140px]"
      />
    </div>

    <div className="relative z-10 bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-10 shadow-xl max-w-md w-full text-center">
      <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-3xl mx-auto mb-5 shadow-sm">
        🚫
      </div>
      <span className="inline-block text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full mb-3">
        403 • Forbidden
      </span>
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">Access Denied</h1>
      <p className="text-slate-500 text-sm mb-6 font-medium">You do not have permission to access this page.</p>
      <Link to="/" className="btn-primary !w-auto inline-flex items-center justify-center px-8 py-3 rounded-xl font-bold shadow-md shadow-[#3b38e4]/25">
        Go Back Home
      </Link>
    </div>
  </div>
);

export const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#f8faff] p-4 text-slate-800">
    {/* SapphireIQ Ambient Glow Backdrop (Light) */}
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e0e7ff25_1px,transparent_1px),linear-gradient(to_bottom,#e0e7ff25_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      <motion.div
        animate={{ x: [0, 25, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-32 -left-20 w-[550px] h-[550px] rounded-full bg-[#3b38e4]/08 blur-[130px]"
      />
      <motion.div
        animate={{ x: [0, -30, 0], y: [0, 35, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-1/4 -right-24 w-[600px] h-[600px] rounded-full bg-[#00b4d8]/08 blur-[140px]"
      />
    </div>

    <div className="relative z-10 bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-10 shadow-xl max-w-md w-full text-center">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-3xl mx-auto mb-5 shadow-sm">
        🌿
      </div>
      <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#3b38e4] bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full mb-3">
        404 • Not Found
      </span>
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">Page Not Found</h1>
      <p className="text-slate-500 text-sm mb-6 font-medium">The page you are looking for doesn&apos;t exist or has moved.</p>
      <Link to="/" className="btn-primary !w-auto inline-flex items-center justify-center px-8 py-3 rounded-xl font-bold shadow-md shadow-[#3b38e4]/25">
        Go Back Home
      </Link>
    </div>
  </div>
);
