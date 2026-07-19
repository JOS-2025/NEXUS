import React from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle, Info, Users, ShieldCheck, HeartHandshake } from 'lucide-react';

export default function AboutContact() {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [subject, setSubject] = React.useState('general');
  const [message, setMessage] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
      setName('');
      setEmail('');
      setMessage('');
    }, 1200);
  };

  const values = [
    { icon: <ShieldCheck className="w-6 h-6 text-indigo-600" />, title: "Technical Integrity", desc: "We audit codebase architectures, benchmark models, and reject promotional marketing fluff." },
    { icon: <HeartHandshake className="w-6 h-6 text-indigo-600" />, title: "Zero AI-Slop", desc: "Every article is researched, formatted with pristine structure, and verified by industry professionals." },
    { icon: <Users className="w-6 h-6 text-indigo-600" />, title: "Community First", desc: "We construct open directories and free resource blueprint libraries to democratize access." }
  ];

  return (
    <div className="space-y-12 text-left animate-in fade-in duration-300">
      
      {/* About Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-7 space-y-4">
          <div className="inline-flex items-center space-x-1 px-3 py-1 bg-indigo-50 border border-indigo-100/50 rounded-full text-indigo-700 text-xs font-semibold">
            <Info className="w-3.5 h-3.5 text-indigo-500" />
            <span>Our Mission & Core Manifesto</span>
          </div>

          <h1 className="font-sans font-black text-3xl sm:text-4xl text-gray-900 tracking-tight leading-none">
            An Open digital publishing platform designed for technology practitioners.
          </h1>

          <p className="font-sans text-sm text-gray-500 leading-relaxed">
            Nexus was established in 2026 to cut through the repetitive marketing noises of the Artificial Intelligence cycle. 
            We build and host deep engineering tutorials, provide transparent comparison pricing metrics for emerging AI services, 
            and offer free downloadable prompt templates and architectural planning guides.
          </p>

          <p className="font-sans text-sm text-gray-500 leading-relaxed">
            Our writing is backed entirely by cloud servers, server-side code execution checks, and active contributions 
            from seasoned technical leaders.
          </p>
        </div>

        {/* Visual card badge */}
        <div className="md:col-span-5 bg-gradient-to-tr from-indigo-900 to-slate-900 text-white rounded-3xl p-8 border border-indigo-950 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
          <span className="font-mono text-[9px] uppercase font-bold text-indigo-400 tracking-widest block mb-1">Corporate Headquarters</span>
          <h3 className="font-sans font-black text-xl text-white tracking-tight leading-tight">Nexus Editorial Hub</h3>
          
          <div className="space-y-4 mt-6 text-xs text-slate-300">
            <div className="flex items-start space-x-3">
              <MapPin className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <span>Nairobi, Kenya</span>
            </div>
            <div className="flex items-start space-x-3">
              <Mail className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <span>josphatmuchemi976@gmail.com</span>
            </div>
            <div className="flex items-start space-x-3">
              <Phone className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <span>+254 795 841 161</span>
            </div>
          </div>
        </div>
      </div>

      {/* Values Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {values.map((v, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs space-y-3">
            <div className="p-2.5 bg-indigo-50/50 rounded-2xl w-max">
              {v.icon}
            </div>
            <h4 className="font-sans font-bold text-base text-gray-900">{v.title}</h4>
            <p className="font-sans text-xs text-gray-500 leading-relaxed">{v.desc}</p>
          </div>
        ))}
      </div>

      {/* Contact Form Section */}
      <div className="bg-slate-50 border border-slate-100/80 rounded-3xl p-6 sm:p-10 max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-1">
          <h2 className="font-sans font-black text-xl sm:text-2xl text-gray-900 tracking-tight">Direct Editorial Query Terminal</h2>
          <p className="text-xs text-gray-500">
            Have a feedback review? Want to submit an article draft pitch? Drop our editors a secure message below.
          </p>
        </div>

        {success ? (
          <div className="bg-white border border-emerald-100 text-emerald-700 rounded-2xl p-6 text-center space-y-3 shadow-xs animate-in zoom-in duration-200">
            <CheckCircle className="w-10 h-10 mx-auto text-emerald-500" />
            <h4 className="font-sans font-bold text-base text-gray-900">Message Dispatched!</h4>
            <p className="text-xs text-gray-500 max-w-sm mx-auto leading-normal">
              Your inquiry has been stored. Our chief editor will review your message within 2 business hours.
            </p>
            <button
              onClick={() => setSuccess(false)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 underline underline-offset-4 cursor-pointer focus:outline-none"
            >
              Submit another query
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider block">Full Name</span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider block">Email Address</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@company.com"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider block">Topic Classification</span>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-gray-700 focus:outline-none cursor-pointer"
              >
                <option value="general">General Platform Inquiry</option>
                <option value="pitch">Author Editorial Pitch / Draft Proposal</option>
                <option value="advertise">Sponsorship / Advertisements</option>
                <option value="abuse">Security audit / Bug report</option>
              </select>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider block">Query Message Content</span>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message description here. Be as specific as possible..."
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-normal"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-xs shadow-md shadow-indigo-100 transition-colors flex items-center justify-center space-x-1.5 focus:outline-none"
            >
              {submitting ? (
                <span>Dispatching...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch Message</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>

    </div>
  );
}
