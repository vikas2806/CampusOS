import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, FileText, CheckCircle2, ArrowLeft, Mail, AlertCircle } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="relative overflow-hidden pt-10 pb-24 lg:pt-16 lg:pb-32">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-indigo-600/10 blur-[140px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        {/* Header */}
        <div className="mb-12 border-b border-slate-800 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>DPDP Act 2023 Compliant</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            Privacy Policy & Student Data Charter
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Effective Date: October 2026 • CampusOS Technologies for Indian Higher Education Institutions.
          </p>
        </div>

        {/* Content sections */}
        <div className="space-y-10 text-slate-300 text-sm sm:text-base leading-relaxed">
          {/* Section 1 */}
          <section className="p-6 sm:p-8 rounded-3xl bg-slate-900/40 border border-slate-800/80 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
              <Lock className="w-5 h-5 text-indigo-400" />
              <span>1. Student Data Collection & Purpose</span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              When students register for college fests, workshops, or hackathons on CampusOS, we collect minimal necessary details required for event security and gate admission:
            </p>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-300 pl-4 border-l-2 border-indigo-500/30">
              <li>• <strong>Identity Data:</strong> Full Name, College Roll Number / Student ID, and Academic Email.</li>
              <li>• <strong>Event Logistics:</strong> Academic Branch/Year, Food Preference (for overnight hackathons), and T-Shirt size.</li>
              <li>• <strong>Admission Token:</strong> An encrypted dynamic QR ticket token linked solely to your confirmed registration ID.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="p-6 sm:p-8 rounded-3xl bg-slate-900/40 border border-slate-800/80 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
              <FileText className="w-5 h-5 text-violet-400" />
              <span>2. Strict Anti-Selling & Zero Third-Party Monetization</span>
            </h2>
            <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs sm:text-sm font-medium">
              CampusOS NEVER sells, rents, brokers, or markets student phone numbers or personal records to ed-tech lead brokers, coaching centers, or predatory lenders.
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Student information is used exclusively by the authorized organizing committee of the registered event for admission, volunteer coordination, and certificate delivery.
            </p>
          </section>

          {/* Section 3 */}
          <section className="p-6 sm:p-8 rounded-3xl bg-slate-900/40 border border-slate-800/80 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>3. Public Certificate Verification Transparency</span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Certificates generated through CampusOS include a cryptographic serial code and QR verification URL. By design, any party accessing the verification link (e.g., job recruiters or university admissions) will view only:
            </p>
            <ul className="space-y-1.5 text-xs sm:text-sm text-slate-300">
              <li>✓ Participant's Verified Name and College/Institution Name</li>
              <li>✓ Event Title, Date of Completion, and Organizing Club Name</li>
              <li>✓ Authentic Cryptographic Signature & Verification Timestamp</li>
            </ul>
            <p className="text-xs text-slate-500 mt-2">
              Personal contact details, email addresses, and phone numbers are never publicly disclosed on verification pages.
            </p>
          </section>

          {/* Section 4 */}
          <section className="p-6 sm:p-8 rounded-3xl bg-slate-900/40 border border-slate-800/80 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              <span>4. Institutional Ownership & Data Sovereignty</span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              The affiliated college, technical club, or university retains 100% legal ownership over its event attendee rosters, volunteer task boards, and budget ledgers. Organizers can export all data to CSV formats at any time or request permanent erasure upon conclusion of their student leadership term.
            </p>
          </section>

          {/* Section 5 */}
          <section className="p-6 sm:p-8 rounded-3xl bg-slate-900/40 border border-slate-800/80 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
              <Mail className="w-5 h-5 text-amber-400" />
              <span>5. Grievance Officer & Erasure Requests</span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              For student data rectification, account removal, or compliance inquiries under India's Digital Personal Data Protection (DPDP) Act, reach out to our privacy officer directly:
            </p>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-300 font-mono">
              Email: privacy@campusos.in <br />
              Attn: Student Data Protection Officer, CampusOS Technologies
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
