import { Link } from "react-router-dom";
import { Sprout, Mail, ArrowRight, Globe, Share2, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative bg-gray-950 border-t border-primary-500/20 text-gray-300 pt-20 pb-10 overflow-hidden">
      {/* Subtle glow effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-primary-500/50 to-transparent blur-sm" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary-500/20 p-2 rounded-xl backdrop-blur-md border border-primary-400/30">
                 <Sprout className="w-6 h-6 text-primary-400" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white drop-shadow-md">
                Krishi<span className="text-primary-400">Dhara</span>
              </span>
            </div>
            <p className="text-gray-400 font-light leading-relaxed">
              Empowering India&apos;s agricultural ecosystem through digital innovation. Connecting farmers, labor, and dealers seamlessly.
            </p>
            <div className="flex items-center gap-4 mt-2">
              <a href="#" className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-primary-500/20 hover:border-primary-500/50 hover:text-primary-400 transition-all text-gray-400">
                <Globe className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-primary-500/20 hover:border-primary-500/50 hover:text-primary-400 transition-all text-gray-400">
                <Share2 className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-primary-500/20 hover:border-primary-500/50 hover:text-primary-400 transition-all text-gray-400">
                <Phone className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-primary-500/20 hover:border-primary-500/50 hover:text-primary-400 transition-all text-gray-400">
                <MapPin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Portals */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">Platform Portals</h3>
            <ul className="flex flex-col gap-4">
              <li><Link to="/register" className="hover:text-primary-400 transition-colors inline-flex items-center gap-2"><ArrowRight className="w-4 h-4 text-primary-500" /> Farmers Portal</Link></li>
              <li><Link to="/register" className="hover:text-primary-400 transition-colors inline-flex items-center gap-2"><ArrowRight className="w-4 h-4 text-primary-500" /> Labor Network</Link></li>
              <li><Link to="/register" className="hover:text-primary-400 transition-colors inline-flex items-center gap-2"><ArrowRight className="w-4 h-4 text-primary-500" /> Dealers Market</Link></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">Resources</h3>
            <ul className="flex flex-col gap-4">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">How it Works</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Market Prices</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Support</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">Stay Updated</h3>
            <p className="text-gray-400 mb-4 font-light">Subscribe for weekly mandi prices and weather alerts in your region.</p>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 transition-all"
                />
              </div>
              <button className="bg-primary-600 hover:bg-primary-500 text-white p-3 rounded-xl transition-colors">
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} KrishiDhara. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
