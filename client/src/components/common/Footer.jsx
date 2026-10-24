import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Heart, Github, Twitter, Linkedin, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/80 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/25">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Campus<span className="text-indigo-400">OS</span>
              </span>
            </Link>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              The modern operating system empowering Indian college clubs, hackathons, technical societies, and cultural fests with automated registrations, QR entry, and verifiable certificates.
            </p>
            <div className="flex items-center gap-3 pt-2 text-slate-400">
              <a href="https://github.com/vikas2806/CampusOS" target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-900 hover:text-white hover:bg-slate-800 transition-colors">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-slate-900 hover:text-white hover:bg-slate-800 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-slate-900 hover:text-white hover:bg-slate-800 transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Product links */}
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">Product</h4>
            <ul className="space-y-2.5">
              <li><Link to="/events" className="hover:text-indigo-400 transition-colors">Explore Campus Events</Link></li>
              <li><Link to="/#features" className="hover:text-indigo-400 transition-colors">QR Attendance & Check-in</Link></li>
              <li><Link to="/#features" className="hover:text-indigo-400 transition-colors">Budget & Volunteer Manager</Link></li>
              <li><Link to="/verify" className="hover:text-indigo-400 transition-colors">Certificate Verification</Link></li>
              <li><Link to="/#pricing" className="hover:text-indigo-400 transition-colors">Pricing & Plans</Link></li>
            </ul>
          </div>

          {/* Solutions */}
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">Use Cases</h4>
            <ul className="space-y-2.5">
              <li><span className="hover:text-indigo-400 transition-colors cursor-pointer">Flagship Hackathons</span></li>
              <li><span className="hover:text-indigo-400 transition-colors cursor-pointer">Technical Student Chapters (ACM, IEEE)</span></li>
              <li><span className="hover:text-indigo-400 transition-colors cursor-pointer">College Cultural Fests</span></li>
              <li><span className="hover:text-indigo-400 transition-colors cursor-pointer">Departmental Workshops</span></li>
              <li><span className="hover:text-indigo-400 transition-colors cursor-pointer">Dean of Student Affairs Oversight</span></li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">Contact & Support</h4>
            <ul className="space-y-2.5">
              <li><Link to="/contact" className="hover:text-indigo-400 transition-colors">Request Campus Demo</Link></li>
              <li><Link to="/contact" className="hover:text-indigo-400 transition-colors">Help Center & Docs</Link></li>
              <li><Link to="/privacy" className="hover:text-indigo-400 transition-colors">Privacy Policy</Link></li>
              <li><a href="mailto:support@campusos.in" className="hover:text-indigo-400 transition-colors flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> support@campusos.in</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} CampusOS Technologies. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Designed for colleges & student communities across India <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </p>
        </div>
      </div>
    </footer>
  );
}
