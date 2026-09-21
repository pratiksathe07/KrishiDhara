import { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { Sprout, Tractor, HardHat, Store, ArrowRight, Leaf, Play } from "lucide-react";
import Footer from "../components/Footer";
import LanguageSwitcher from "../components/ui/LanguageSwitcher";
import { useTranslation } from "react-i18next";

const Home = () => {
  const { isAuthenticated, role } = useAuth();
  const { t } = useTranslation();

  // Scroll animations for the video section
  const videoSectionRef = useRef(null);
  const videoRef = useRef(null);
  const isVideoInView = useInView(videoSectionRef, { amount: 0.5 }); // Trigger when 50% in view

  const { scrollYProgress } = useScroll({
    target: videoSectionRef,
    offset: ["start end", "end start"]
  });

  // Scale down as it enters, then scale up as it leaves
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.1, 1, 1.1]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.3, 1, 1, 0.3]);

  useEffect(() => {
    if (videoRef.current) {
      if (isVideoInView) {
        videoRef.current.play().catch(e => console.log("Autoplay prevented:", e));
      } else {
        videoRef.current.pause();
      }
    }
  }, [isVideoInView]);

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

  const rollOut = {
    hidden: { opacity: 0, x: -50, rotate: -15 },
    show: { opacity: 1, x: 0, rotate: 0, transition: { duration: 0.8, type: "spring", bounce: 0.4 } },
  };

  return (
    <div className="relative min-h-screen bg-gray-900 overflow-hidden text-white font-sans">
      {/* Background Image with slow zoom animation (Reverted back from Video) */}
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
        <nav className="w-full max-w-7xl mx-auto px-6 py-2 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-3 shrink-0"
          >
            <Link to="/" className="flex items-center"><img src="/logo.png" alt="KrishiDhara Logo" className="h-28 w-auto object-contain drop-shadow-lg rounded-xl" /></Link>
          </motion.div>

          <motion.div variants={fadeInUp} initial="hidden" animate="show" className="hidden lg:inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary-500/30 bg-primary-900/30 backdrop-blur-md shadow-inner whitespace-nowrap">
            <Leaf className="w-4 h-4 text-primary-400" />
            <span className="text-sm font-medium text-primary-200 tracking-wide uppercase">{t('home.navTagline')}</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-4"
          >
            <LanguageSwitcher />
            {isAuthenticated ? (
              <Link to={`/${role}/dashboard`} className="px-6 py-2.5 rounded-full bg-primary-600 hover:bg-primary-500 text-white font-medium transition-all shadow-glow hover:shadow-none hover:scale-105 active:scale-95 flex items-center gap-2">
                {t('home.dashboard')} <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link to="/login" className="px-6 py-2.5 rounded-full text-gray-200 hover:text-white hover:bg-white/10 transition-colors font-medium backdrop-blur-sm">
                  {t('home.login')}
                </Link>
                <Link to="/register" className="px-6 py-2.5 rounded-full bg-primary-600 hover:bg-primary-500 text-white font-medium transition-all shadow-glow hover:shadow-none hover:scale-105 active:scale-95 flex items-center gap-2">
                  {t('home.getStarted')}
                </Link>
              </>
            )}
          </motion.div>
        </nav>

        {/* Interactive Scroll Video Section (Moved ABOVE the main Hero) */}
        <section ref={videoSectionRef} className="relative w-full max-w-7xl mx-auto px-6 pt-0 pb-20 flex flex-col items-center justify-start">
          <motion.div
            style={{ opacity, scale }}
            className="w-full h-[65vh] sm:h-[75vh] rounded-[2.5rem] overflow-hidden relative shadow-[0_0_60px_rgba(34,197,94,0.15)] border border-white/10 group cursor-default bg-gray-900"
          >
            {/* The Actual Video Element */}
            <video
              ref={videoRef}
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover opacity-80"
              poster="/farmer-video-poster.jpg"
            >
              {/* Local video uploaded by the user */}
              <source src="/farmer.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-900/40 to-transparent flex flex-col justify-end p-8 sm:p-16">
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: false, margin: "-50px" }}
                className="max-w-2xl"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md mb-6 border border-white/20">
                  <div className="bg-primary-500 rounded-full p-1">
                    <Play className="w-3 h-3 text-white fill-white" />
                  </div>
                  <span className="text-xs font-semibold text-white tracking-widest uppercase">{t('home.interactiveVision')}</span>
                </div>
                <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 drop-shadow-xl leading-tight">
                  {t('home.futureOf')} <br />
                  <span className="text-primary-400">{t('home.digitalFarming')}</span>
                </h2>

                <p className="text-lg sm:text-xl text-gray-300 drop-shadow-md font-light leading-relaxed mb-8">
                  {/* Experience the seamless integration of traditional griculture with modern digital solutions. As you scroll into this section, the video comes alive. */}
                </p>

                <div className="flex flex-col sm:flex-row items-start justify-start gap-4">
                  <Link to="/register" className="group px-8 py-4 rounded-full bg-primary-600 hover:bg-primary-500 text-white font-semibold text-lg transition-all shadow-glow hover:shadow-[0_0_25px_rgba(34,197,94,0.6)] hover:scale-105 active:scale-95 flex items-center gap-2">
                    {t('home.startJourney')}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Hero Section */}
        <main className="flex-grow flex flex-col items-center justify-center px-6 py-20 text-center">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="max-w-4xl mx-auto"
          >


            <motion.h1 variants={fadeInUp} className="text-5xl sm:text-7xl font-extrabold mb-8 leading-tight tracking-tight drop-shadow-xl text-balance">
              {t('home.heroTitle1')} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-emerald-300 filter drop-shadow-lg">
                {t('home.heroTitle2')}
              </span>
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-lg sm:text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed drop-shadow-md font-light">
              {t('home.heroSubtitle')}
            </motion.p>


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
              { icon: Tractor, role: t('register.farmer'), desc: t('home.farmerDesc'), color: "from-green-500/20 to-emerald-600/20", iconColor: "text-emerald-400" },
              { icon: HardHat, role: t('register.labour'), desc: t('home.labourDesc'), color: "from-amber-500/20 to-orange-600/20", iconColor: "text-amber-400" },
              { icon: Store, role: t('register.dealer'), desc: t('home.dealerDesc'), color: "from-blue-500/20 to-indigo-600/20", iconColor: "text-blue-400" },
            ].map((card, idx) => (
              <motion.div
                key={card.role}
                variants={rollOut}
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
      <Footer />
    </div>
  );
};

export default Home;
