import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { Sprout, Tractor, HardHat, Store, ArrowRight, Leaf } from "lucide-react";

const Home = () => {
  const { isAuthenticated, role } = useAuth();

  // Animation variants
  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  return (
    <div className="relative min-h-screen bg-gray-900 overflow-hidden text-white font-sans">
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

      {/* Content wrapper */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Transparent Navbar */}
        <nav className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-3"
          >
            <div className="bg-primary-500 p-2 rounded-xl bg-opacity-20 backdrop-blur-md border border-primary-400/30">
               <Sprout className="w-8 h-8 text-primary-400" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white drop-shadow-md">
              Krishi<span className="text-primary-400">Dhara</span>
            </span>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-4"
          >
            {isAuthenticated ? (
              <Link to={`/${role}/dashboard`} className="px-6 py-2.5 rounded-full bg-primary-600 hover:bg-primary-500 text-white font-medium transition-all shadow-glow hover:shadow-none hover:scale-105 active:scale-95 flex items-center gap-2">
                Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link to="/login" className="px-6 py-2.5 rounded-full text-gray-200 hover:text-white hover:bg-white/10 transition-colors font-medium backdrop-blur-sm">
                  Login
                </Link>
                <Link to="/register" className="px-6 py-2.5 rounded-full bg-primary-600 hover:bg-primary-500 text-white font-medium transition-all shadow-glow hover:shadow-none hover:scale-105 active:scale-95 flex items-center gap-2">
                  Get Started
                </Link>
              </>
            )}
          </motion.div>
        </nav>

        {/* Hero Section */}
        <main className="flex-grow flex flex-col items-center justify-center px-6 py-20 text-center">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="max-w-4xl mx-auto"
          >
            <motion.div variants={fadeInUp} className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary-500/30 bg-primary-900/30 backdrop-blur-md shadow-inner">
              <Leaf className="w-4 h-4 text-primary-400" />
              <span className="text-sm font-medium text-primary-200 tracking-wide uppercase">Connecting Agriculture, Digitally</span>
            </motion.div>

            <motion.h1 variants={fadeInUp} className="text-5xl sm:text-7xl font-extrabold mb-8 leading-tight tracking-tight drop-shadow-xl text-balance">
              Empowering India&apos;s <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-emerald-300 filter drop-shadow-lg">
                Agricultural Community
              </span>
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-lg sm:text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed drop-shadow-md font-light">
              KrishiDhara connects farmers with agricultural labor and dealers — streamlining hiring, trading, and field management for rural India with modern technology.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="group px-8 py-4 rounded-full bg-primary-600 hover:bg-primary-500 text-white font-semibold text-lg transition-all shadow-glow hover:shadow-[0_0_25px_rgba(34,197,94,0.6)] hover:scale-105 active:scale-95 flex items-center gap-2">
                Start Your Journey
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>
        </main>

        {/* Role Cards Section */}
        <section className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-24">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid sm:grid-cols-3 gap-6 lg:gap-8"
          >
            {[
              { icon: Tractor, role: "Farmer", desc: "Manage your land, crops, hire agricultural workers and connect with dealers directly.", color: "from-green-500/20 to-emerald-600/20", iconColor: "text-emerald-400" },
              { icon: HardHat, role: "Labor", desc: "Find agricultural work near you. Showcase your skills and get hired by farmers.", color: "from-amber-500/20 to-orange-600/20", iconColor: "text-amber-400" },
              { icon: Store, role: "Dealer", desc: "Connect with farmers to buy and sell agricultural produce and commodities seamlessly.", color: "from-blue-500/20 to-indigo-600/20", iconColor: "text-blue-400" },
            ].map((card, idx) => (
              <motion.div
                key={card.role}
                variants={fadeInUp}
                whileHover={{ y: -10, transition: { duration: 0.2 } }}
                className="group relative overflow-hidden rounded-3xl p-1 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] transition-all hover:border-white/20"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative h-full bg-gray-900/50 rounded-[1.4rem] p-8 backdrop-blur-md flex flex-col items-start z-10">
                  <div className={`p-4 rounded-2xl bg-white/5 mb-6 ring-1 ring-white/10 group-hover:ring-white/30 transition-all ${card.iconColor}`}>
                    <card.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 tracking-wide">{card.role}</h3>
                  <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                    {card.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>
      </div>
    </div>
  );
};

export default Home;
