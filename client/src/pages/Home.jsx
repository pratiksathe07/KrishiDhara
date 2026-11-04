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
    <div className="relative min-h-screen bg-gradient-to-b from-[#f3f7ff] via-[#ffffff] to-[#f8faff] overflow-hidden text-slate-800 font-sans">
      {/* SapphireIQ Style Navbar — Clean White Glass with Electric Indigo CTA */}
      <header className="w-full h-[74px] bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 shadow-sm flex items-center">
        <nav className="w-full max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-3 shrink-0"
          >
            <Link to="/" className="flex items-center">
              <img src="/logo.png" alt="KrishiDhara Logo" className="h-[52px] sm:h-[58px] w-auto object-contain drop-shadow-sm rounded-lg" />
            </Link>
          </motion.div>

          <motion.div variants={fadeInUp} initial="hidden" animate="show" className="hidden lg:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-slate-200 bg-slate-50 shadow-sm whitespace-nowrap">
            <span className="h-1.5 w-1.5 rounded-full bg-[#3b38e4]"></span>
            <span className="text-xs font-semibold text-slate-700 tracking-wide uppercase">{t('home.navTagline')}</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-3 sm:gap-4"
          >
            <LanguageSwitcher light={true} />
            {isAuthenticated ? (
              <Link to={`/${role}/dashboard`} className="px-5 py-2.5 rounded-xl bg-[#3b38e4] hover:bg-[#302dc4] text-white font-bold text-sm shadow-md shadow-[#3b38e4]/25 hover:shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5">
                {t('home.dashboard')} <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-slate-700 hover:text-[#3b38e4] text-sm font-semibold transition-colors">
                  {t('home.login')}
                </Link>
                <Link to="/register" className="px-5 py-2.5 rounded-xl bg-[#3b38e4] hover:bg-[#302dc4] text-white font-bold text-sm shadow-md shadow-[#3b38e4]/25 hover:shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5">
                  {t('home.getStarted')}
                </Link>
              </>
            )}
          </motion.div>
        </nav>
      </header>

      {/* Content wrapper */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Hero Section — SapphireIQ Style */}
        <main className="flex-grow flex flex-col items-center justify-center px-6 pt-16 pb-14 text-center">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="max-w-4xl mx-auto w-full"
          >
            {/* Kicker Badge */}
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100/80 text-[#3b38e4] text-xs font-bold tracking-widest uppercase mb-6 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[#3b38e4] animate-pulse"></span>
              <span>SMART AGRICULTURE PLATFORM</span>
            </motion.div>

            {/* Headline with Sapphire Cyan-to-Purple Gradient Accent */}
            <motion.h1 variants={fadeInUp} className="text-5xl sm:text-7xl font-extrabold mb-6 leading-[1.12] tracking-tight text-slate-900 text-balance">
              {t('home.heroTitle1')} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00b4d8] via-[#3b38e4] to-[#8b5cf6]">
                {t('home.heroTitle2')}
              </span>
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-lg sm:text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed font-normal">
              {t('home.heroSubtitle')}
            </motion.p>

            {/* SapphireIQ Action Buttons */}
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-14">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#3b38e4] hover:bg-[#302dc4] text-white font-bold text-base shadow-lg shadow-[#3b38e4]/25 hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>{t('home.getStarted')}</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 hover:border-slate-300 font-semibold text-base shadow-sm hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>{t('home.login')}</span>
              </Link>
            </motion.div>

            {/* SapphireIQ Metrics / Pillars Row */}
            <motion.div variants={fadeInUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto w-full">
              {[
                { value: "5,000+", label: "Active Farmers" },
                { value: "1,200+", label: "Skilled Labour" },
                { value: "850+", label: "Verified Dealers" },
                { value: "100%", label: "Direct Marketplace" },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="bg-white/90 border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:border-[#3b38e4]/40 hover:shadow-md transition-all text-left group"
                >
                  <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 group-hover:text-[#3b38e4] transition-colors tracking-tight mb-1">{stat.value}</p>
                  <p className="text-xs sm:text-sm font-medium text-slate-500">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </main>

        {/* Interactive Scroll Video Section */}
        <section ref={videoSectionRef} className="relative w-full max-w-7xl mx-auto px-6 pt-4 pb-20 flex flex-col items-center justify-start">
          <motion.div
            style={{ opacity, scale }}
            className="w-full h-[65vh] sm:h-[75vh] rounded-[2.5rem] overflow-hidden relative shadow-2xl border border-slate-200/80 group cursor-default bg-slate-950"
          >
            <video
              ref={videoRef}
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover opacity-80"
              poster="/farmer-video-poster.jpg"
            >
              <source src="/farmer.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-900/40 to-transparent flex flex-col justify-end p-8 sm:p-16">
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: false, margin: "-50px" }}
                className="max-w-2xl"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md mb-6 border border-white/20">
                  <div className="bg-[#3b38e4] rounded-full p-1">
                    <Play className="w-3 h-3 text-white fill-white" />
                  </div>
                  <span className="text-xs font-semibold text-white tracking-widest uppercase">{t('home.interactiveVision')}</span>
                </div>
                <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 drop-shadow-xl leading-tight">
                  {t('home.futureOf')} <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00b4d8] via-sky-300 to-[#8b5cf6]">{t('home.digitalFarming')}</span>
                </h2>

                <div className="flex flex-col sm:flex-row items-start justify-start gap-4">
                  <Link to="/register" className="group px-8 py-4 rounded-xl bg-[#3b38e4] hover:bg-[#302dc4] text-white font-semibold text-lg transition-all shadow-md shadow-[#3b38e4]/30 hover:scale-105 active:scale-95 flex items-center gap-2">
                    {t('home.startJourney')}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Role Cards Section — SapphireIQ Domain Cards Style */}
        <section className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-24">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[#3b38e4] text-xs font-bold uppercase tracking-widest block mb-2">• KRISHIDHARA ECOSYSTEM</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Bridging the gap between rural agriculture & digital commerce.
            </h2>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
            className="grid sm:grid-cols-3 gap-6 lg:gap-8"
          >
            {[
              {
                icon: Tractor,
                role: t('register.farmer'),
                desc: t('home.farmerDesc'),
                tag: "Land & Crop Management",
                accent: "text-emerald-600",
                badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
              },
              {
                icon: HardHat,
                role: t('register.labour'),
                desc: t('home.labourDesc'),
                tag: "Skilled Labour Network",
                accent: "text-amber-600",
                badge: "bg-amber-50 text-amber-700 border-amber-200",
              },
              {
                icon: Store,
                role: t('register.dealer'),
                desc: t('home.dealerDesc'),
                tag: "Produce Trading Hub",
                accent: "text-[#3b38e4]",
                badge: "bg-indigo-50 text-[#3b38e4] border-indigo-200",
              },
            ].map((card) => (
              <motion.div
                key={card.role}
                variants={rollOut}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="group relative overflow-hidden rounded-3xl p-8 bg-white border border-slate-200/90 hover:border-[#3b38e4]/50 shadow-md shadow-slate-200/50 hover:shadow-xl hover:shadow-[#3b38e4]/10 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className={`p-4 rounded-2xl bg-slate-50 border border-slate-100 ${card.accent} shadow-sm transition-transform group-hover:scale-110 duration-200`}>
                      <card.icon className="w-7 h-7" />
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${card.badge}`}>
                      {card.tag}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">{card.role}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {card.desc}
                  </p>
                </div>
                <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#3b38e4] group-hover:translate-x-1 transition-transform">
                  <span>Explore Portal</span>
                  <ArrowRight className="w-4 h-4" />
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
