import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ChevronDown } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English', short: 'EN' },
  { code: 'hi', name: 'हिंदी', short: 'HI' },
  { code: 'mr', name: 'मराठी', short: 'MR' },
  { code: 'gu', name: 'ગુજરાતી', short: 'GU' },
  { code: 'ta', name: 'தமிழ்', short: 'TA' }
];

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // i18n.language can be something like 'en-US', so we just match the start, or default to 'en'
  const currentLang = languages.find(l => (i18n.language || 'en').startsWith(l.code)) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left z-50" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl shadow-sm backdrop-blur-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/30"
      >
        <Globe className="w-4 h-4 text-white/80" />
        <span className="hidden sm:inline-block">{currentLang.name}</span>
        <span className="sm:hidden">{currentLang.short}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-white/70 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-32 origin-top-right rounded-xl bg-[#1e293b]/90 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden"
          >
            <div className="py-1.5 flex flex-col">
              {languages.map((lng) => (
                <button
                  key={lng.code}
                  onClick={() => changeLanguage(lng.code)}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    currentLang.code === lng.code
                      ? 'bg-white/15 text-white font-semibold'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {lng.name}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSwitcher;
