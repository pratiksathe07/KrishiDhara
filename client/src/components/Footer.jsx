import { Link } from "react-router-dom";
import { Sprout, Mail, ArrowRight, Globe, Share2, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative bg-slate-50 border-t border-sky-100 text-slate-600 pt-16 pb-10 overflow-hidden">
      {/* Subtle light glow effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-sky-400/60 to-transparent blur-sm" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <a href="/">
                <img src="/logo.png" alt="KrishiDhara Logo" className="h-24 w-auto object-contain drop-shadow-sm rounded-xl" />
              </a>
            </div>
            <p className="text-slate-600 font-normal leading-relaxed">
              Empowering India&apos;s agricultural ecosystem through digital innovation. Connecting farmers, labour, and dealers seamlessly.
            </p>
            <div className="flex items-center gap-4 mt-2">
              <a href="#" className="p-2.5 rounded-full bg-white border border-slate-200 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-600 transition-all text-slate-500 shadow-sm">
                <Globe className="w-4 h-4" />
              </a>
              <a href="#" className="p-2.5 rounded-full bg-white border border-slate-200 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-600 transition-all text-slate-500 shadow-sm">
                <Share2 className="w-4 h-4" />
              </a>
              <a href="#" className="p-2.5 rounded-full bg-white border border-slate-200 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-600 transition-all text-slate-500 shadow-sm">
                <Phone className="w-4 h-4" />
              </a>
              <a href="#" className="p-2.5 rounded-full bg-white border border-slate-200 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-600 transition-all text-slate-500 shadow-sm">
                <MapPin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Portals */}
          <div>
            <h3 className="text-slate-900 font-bold text-lg mb-6">Platform Portals</h3>
            <ul className="flex flex-col gap-3.5">
              <li><Link to="/register" className="hover:text-sky-600 transition-colors inline-flex items-center gap-2 font-medium"><ArrowRight className="w-4 h-4 text-sky-500" /> Farmers Portal</Link></li>
              <li><Link to="/register" className="hover:text-sky-600 transition-colors inline-flex items-center gap-2 font-medium"><ArrowRight className="w-4 h-4 text-sky-500" /> Labour Network</Link></li>
              <li><Link to="/register" className="hover:text-sky-600 transition-colors inline-flex items-center gap-2 font-medium"><ArrowRight className="w-4 h-4 text-sky-500" /> Dealers Market</Link></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-slate-900 font-bold text-lg mb-6">Resources</h3>
            <ul className="flex flex-col gap-3.5">
              <li><a href="#" className="hover:text-sky-600 transition-colors font-medium">About Us</a></li>
              <li><a href="#" className="hover:text-sky-600 transition-colors font-medium">How it Works</a></li>
              <li><a href="#" className="hover:text-sky-600 transition-colors font-medium">Market Prices</a></li>
              <li><a href="#" className="hover:text-sky-600 transition-colors font-medium">Help Center</a></li>
              <li><a href="#" className="hover:text-sky-600 transition-colors font-medium">Contact Support</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-slate-900 font-bold text-lg mb-6">Stay Updated</h3>
            <p className="text-slate-600 mb-4 font-normal">Subscribe for weekly mandi prices and weather alerts in your region.</p>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#3b38e4] focus:ring-2 focus:ring-[#3b38e4]/20 transition-all shadow-sm"
                />
              </div>
              <button className="bg-[#3b38e4] hover:bg-[#302dc4] text-white p-3 rounded-xl transition-all shadow-md shadow-[#3b38e4]/20 hover:scale-105 active:scale-95">
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p>© {new Date().getFullYear()} KrishiDhara. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-sky-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-sky-600 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
