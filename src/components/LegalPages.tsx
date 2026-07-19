import React from 'react';
import { Shield, FileText, Calendar, ArrowLeft, ChevronRight, HelpCircle, UserCheck } from 'lucide-react';
import { getWebsiteSettings } from '../lib/settings';

interface LegalPagesProps {
  initialTab?: 'terms' | 'privacy';
  onBack?: () => void;
}

export default function LegalPages({ initialTab = 'terms', onBack }: LegalPagesProps) {
  const [activeTab, setActiveTab] = React.useState<'terms' | 'privacy'>(initialTab);
  const [activeSection, setActiveSection] = React.useState<string>('');
  const [settings, setSettings] = React.useState(getWebsiteSettings());

  React.useEffect(() => {
    const updateSettings = () => {
      setSettings(getWebsiteSettings());
    };
    window.addEventListener('nexus_settings_changed', updateSettings);
    return () => window.removeEventListener('nexus_settings_changed', updateSettings);
  }, []);

  React.useEffect(() => {
    setActiveTab(initialTab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [initialTab]);

  const termsSections = [
    {
      id: "1",
      title: "1. Acceptance of Terms",
      content: "By accessing or using this website, you confirm that you have read, understood, and agreed to these Terms and Conditions, as well as our Privacy Policy."
    },
    {
      id: "2",
      title: "2. About the Platform",
      content: "Our platform provides articles, tutorials, resources, AI tool directories, newsletters, downloadable materials, and other digital content related to artificial intelligence, technology, productivity, entrepreneurship, and related topics."
    },
    {
      id: "3",
      title: "3. User Accounts",
      content: "To access certain features, you may be required to create an account. You agree to:\n• Provide accurate and complete information.\n• Keep your login credentials secure.\n• Notify us immediately if you suspect unauthorized access to your account.\n• Be responsible for all activity that occurs under your account.\nWe reserve the right to suspend or terminate accounts that violate these Terms."
    },
    {
      id: "4",
      title: "4. Acceptable Use",
      content: "You agree not to:\n• Violate any applicable law.\n• Attempt unauthorized access to our systems.\n• Upload malicious software or harmful code.\n• Interfere with the operation of the platform.\n• Harass, abuse, or threaten other users.\n• Publish unlawful, misleading, defamatory, or offensive content.\n• Copy or redistribute content without permission."
    },
    {
      id: "5",
      title: "5. Intellectual Property",
      content: "Unless otherwise stated, all articles, graphics, logos, designs, source code, databases, AI-generated enhancements, and other content on this platform are owned by or licensed to the platform and are protected by applicable intellectual property laws. You may not reproduce, distribute, modify, or commercially exploit any content without prior written permission."
    },
    {
      id: "6",
      title: "6. User-Generated Content",
      content: "If you submit comments, reviews, or other content, you grant us a non-exclusive, worldwide, royalty-free license to display, store, reproduce, and distribute that content for the operation of the platform. You remain responsible for the content you submit."
    },
    {
      id: "7",
      title: "7. AI Features",
      content: "Our platform may provide AI-assisted tools that generate summaries, outlines, recommendations, or other content. AI-generated content is provided for informational purposes only and should be reviewed before being relied upon. We do not guarantee its completeness, accuracy, or suitability for every situation."
    },
    {
      id: "8",
      title: "8. Third-Party Services",
      content: "The platform may include links to third-party websites, services, or products. We are not responsible for the content, privacy practices, or availability of third-party services."
    },
    {
      id: "9",
      title: "9. Downloads and Resources",
      content: "Resources provided through the platform are for personal or authorized business use unless otherwise specified. Redistribution or resale without permission is prohibited."
    },
    {
      id: "10",
      title: "10. Affiliate Links and Sponsored Content",
      content: "Some content may contain affiliate links or sponsored material. Where applicable, we may receive a commission if you purchase products or services through those links at no additional cost to you."
    },
    {
      id: "11",
      title: "11. Disclaimer",
      content: "The information provided on this platform is for educational and informational purposes only. Nothing on this website constitutes legal, financial, investment, medical, or professional advice. Users should seek appropriate professional advice before making decisions based on the information provided."
    },
    {
      id: "12",
      title: "12. Limitation of Liability",
      content: "To the fullest extent permitted by law, we shall not be liable for any direct, indirect, incidental, consequential, or special damages arising from the use of or inability to use the platform."
    },
    {
      id: "13",
      title: "13. Availability",
      content: "We strive to keep the platform available at all times but do not guarantee uninterrupted access. We may modify, suspend, or discontinue any feature without prior notice."
    },
    {
      id: "14",
      title: "14. Termination",
      content: "We reserve the right to suspend or terminate user accounts that violate these Terms or engage in activities that may harm the platform or its users."
    },
    {
      id: "15",
      title: "15. Changes to These Terms",
      content: "We may update these Terms from time to time. The latest version will always be published on this page with the updated effective date."
    },
    {
      id: "16",
      title: "16. Governing Law",
      content: "These Terms shall be governed by the applicable laws of the jurisdiction in which the platform operates, unless otherwise required by applicable law."
    },
    {
      id: "17",
      title: "17. Contact",
      content: "If you have questions regarding these Terms, please contact us through the Contact page on this website."
    }
  ];

  const privacySections = [
    {
      id: "1",
      title: "1. Information We Collect",
      content: "Information You Provide:\nWe may collect information you voluntarily provide, including: Name, Email address, Profile information, Comments and reviews, Newsletter preferences, Messages submitted through contact forms.\n\nAutomatically Collected Information:\nWhen you visit the platform, we may automatically collect: IP address, Browser type, Device information, Operating system, Pages visited, Time spent on pages, Referral sources, Search queries performed on the platform, Cookies and similar technologies."
    },
    {
      id: "2",
      title: "2. How We Use Your Information",
      content: "We may use your information to:\n• Provide and improve our services.\n• Create and manage your account.\n• Personalize your experience.\n• Deliver newsletters.\n• Respond to inquiries.\n• Analyze platform performance.\n• Improve content recommendations.\n• Prevent fraud and unauthorized access.\n• Comply with legal obligations."
    },
    {
      id: "3",
      title: "3. Cookies",
      content: "We may use cookies and similar technologies to:\n• Keep you signed in.\n• Remember preferences.\n• Analyze traffic.\n• Improve performance.\n• Measure marketing effectiveness.\nYou may disable cookies through your browser settings, although some features may not function properly."
    },
    {
      id: "4",
      title: "4. Analytics",
      content: "We may use analytics tools to understand how visitors interact with the platform, including page views, reading time, user engagement, and traffic sources."
    },
    {
      id: "5",
      title: "5. Newsletter",
      content: "If you subscribe to our newsletter, we will use your email address to send updates and other communications you have requested. You may unsubscribe at any time using the unsubscribe link included in our emails."
    },
    {
      id: "6",
      title: "6. AI Features",
      content: "If you use AI-powered features available on the platform, the information you submit may be processed to generate responses or recommendations. We do not intentionally use your submitted content for purposes unrelated to providing the requested service unless otherwise disclosed."
    },
    {
      id: "7",
      title: "7. Sharing Information",
      content: "We do not sell your personal information. We may share information with trusted service providers that help us operate the platform, process payments, deliver emails, host services, analyze traffic, or comply with legal obligations."
    },
    {
      id: "8",
      title: "8. Data Security",
      content: "We implement reasonable administrative, technical, and organizational safeguards to protect your information. However, no method of internet transmission or electronic storage is completely secure."
    },
    {
      id: "9",
      title: "9. Data Retention",
      content: "We retain personal information only for as long as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements."
    },
    {
      id: "10",
      title: "10. Your Rights",
      content: "Depending on applicable law, you may have the right to:\n• Access your personal information.\n• Correct inaccurate information.\n• Delete your information.\n• Restrict or object to processing.\n• Request a copy of your data where applicable.\n• Withdraw consent where processing is based on consent.\nRequests may be submitted through our Contact page."
    },
    {
      id: "11",
      title: "11. Children's Privacy",
      content: "This platform is not directed to children under the age required by applicable law for independent use of online services without parental consent. We do not knowingly collect personal information from children where prohibited by law."
    },
    {
      id: "12",
      title: "12. Third-Party Links",
      content: "Our platform may contain links to third-party websites. We are not responsible for the privacy practices or content of those websites."
    },
    {
      id: "13",
      title: "13. International Data Transfers",
      content: "Where applicable, your information may be processed in countries other than your own. We take reasonable steps to protect your information during such transfers."
    },
    {
      id: "14",
      title: "14. Changes to This Privacy Policy",
      content: "We may update this Privacy Policy periodically. The latest version will always be available on this page with the revised effective date."
    },
    {
      id: "15",
      title: "15. Contact",
      content: "If you have questions about this Privacy Policy or your personal information, please contact us through the Contact page on this website."
    }
  ];

  const currentSections = activeTab === 'terms' ? termsSections : privacySections;

  const handleScrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(`sec-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 text-left animate-in fade-in duration-300">
      {/* Back button and title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div className="space-y-1">
          {onBack && (
            <button
              onClick={onBack}
              className="group inline-flex items-center space-x-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 mb-2 focus:outline-none"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to home</span>
            </button>
          )}
          <h1 className="font-serif font-black text-3xl sm:text-4xl text-white tracking-tight">
            {activeTab === 'terms' ? 'Terms and Conditions' : 'Privacy Policy'}
          </h1>
          <div className="flex items-center space-x-2 text-xs text-gray-400">
            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
            <span>Effective Date: {settings.activeTermsRevision}</span>
          </div>
        </div>

        {/* Tab Selector Toggle */}
        <div className="inline-flex bg-white/5 p-1 rounded-2xl border border-white/5 shrink-0">
          <button
            onClick={() => { setActiveTab('terms'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'terms'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100/10'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>Terms of Service</span>
            </div>
          </button>
          <button
            onClick={() => { setActiveTab('privacy'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'privacy'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100/10'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>Privacy Policy</span>
            </div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Sticky Anchor Navigation Sidebar */}
        <div className="md:col-span-4 lg:col-span-3 md:sticky md:top-24 space-y-4">
          <div className="bg-white/5 border border-white/5 rounded-3xl p-5 space-y-3">
            <h3 className="font-sans font-bold text-xs text-indigo-400 uppercase tracking-widest flex items-center space-x-1.5">
              <span>Section Guide</span>
            </h3>
            <div className="h-[320px] overflow-y-auto pr-1 space-y-1 scrollbar-none">
              {currentSections.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => handleScrollToSection(sec.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-[11px] font-medium transition-all block truncate ${
                    activeSection === sec.id
                      ? 'bg-indigo-600/10 text-indigo-400 font-bold border-l-2 border-indigo-500'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {sec.title}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-tr from-indigo-950/20 to-slate-950/20 border border-white/5 rounded-3xl p-5 space-y-3 text-center">
            <HelpCircle className="w-5 h-5 text-indigo-400 mx-auto" />
            <h4 className="font-sans font-bold text-xs text-white">Have questions?</h4>
            <p className="text-[10px] text-gray-400 leading-normal">
              Our legal & compliance desk is always open for direct questions.
            </p>
            <div className="pt-2 border-t border-white/5 space-y-1.5 text-left font-sans text-[11px] text-slate-300">
              <div className="flex items-center space-x-1.5 overflow-hidden">
                <span className="text-indigo-400 font-bold shrink-0">Email:</span>
                <a href={`mailto:${settings.legalEmail}`} className="hover:underline text-indigo-300 font-mono truncate">{settings.legalEmail}</a>
              </div>
              {settings.legalPhone && (
                <div className="flex items-center space-x-1.5">
                  <span className="text-indigo-400 font-bold shrink-0">Phone:</span>
                  <span className="font-mono text-slate-300 text-[10px]">{settings.legalPhone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="md:col-span-8 lg:col-span-9 bg-white/5 border border-white/5 rounded-3xl p-6 sm:p-10 space-y-12">
          {currentSections.map((sec) => (
            <section
              key={sec.id}
              id={`sec-${sec.id}`}
              className="space-y-3 border-b border-white/5 pb-8 last:border-0 last:pb-0 scroll-mt-28"
            >
              <h2 className="font-serif font-bold text-lg sm:text-xl text-white flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0"></span>
                <span>{sec.title}</span>
              </h2>
              <div className="text-sm text-gray-300 leading-relaxed font-sans whitespace-pre-line space-y-2">
                {sec.content.split('\n').map((paragraph, idx) => {
                  if (paragraph.startsWith('•') || paragraph.startsWith('*')) {
                    return (
                      <li key={idx} className="list-none pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-indigo-500 font-sans">
                        {paragraph.replace(/^[•*]\s*/, '')}
                      </li>
                    );
                  }
                  return (
                    <p key={idx} className="font-sans text-gray-300">
                      {paragraph}
                    </p>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
