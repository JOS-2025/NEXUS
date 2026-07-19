export interface WebsiteSettings {
  siteName: string;
  siteTagline: string;
  siteDescription: string;
  contactEmail: string;
  supportPhone: string;
  legalEmail: string;
  legalPhone: string;
  activeTermsRevision: string;
  termsUrl: string;
  privacyUrl: string;
  complianceDisclosure: string;
  allowGdprBanner: boolean;
  premiumMonthlyPrice: number;
  enableAffiliateDisclosure: boolean;
  stripePublicKey: string;
  enablePayPal: boolean;
  paypalClientId: string;
  paypalClientSecret: string;
  paypalEnvironment: 'sandbox' | 'live';
  selectedGeminiModel: string;
  enableAutoSeoTags: boolean;
  enableAutoEditorialReview: boolean;
  defaultAuthorName: string;
  defaultAuthorAvatar: string;
  analyticsId: string;
  targetKeywords: string;
}

export const DEFAULT_SETTINGS: WebsiteSettings = {
  siteName: "Nexus",
  siteTagline: "AI & Tech Publishing Platform",
  siteDescription: "Nexus is a real, high-performance tech publishing terminal. We write dynamic code, review next-gen algorithms, and deliver executive engineering frameworks.",
  contactEmail: "desk@nexuspublishing.com",
  supportPhone: "+1 (800) 555-0199",
  legalEmail: "compliance@nexuspublishing.com",
  legalPhone: "+1 (800) 555-0144",
  activeTermsRevision: "July 8, 2026",
  termsUrl: "https://nexuspublishing.com/terms",
  privacyUrl: "https://nexuspublishing.com/privacy",
  complianceDisclosure: "AI-assisted tools populate initial analytical indicators and summarize editorial publications. Direct all editorial issues or policy reviews to our compliance desk.",
  allowGdprBanner: true,
  premiumMonthlyPrice: 19.99,
  enableAffiliateDisclosure: true,
  stripePublicKey: "pk_test_51Nx...placeholder",
  enablePayPal: true,
  paypalClientId: "AX_placeholder_client_id_77299xYz",
  paypalClientSecret: "EP_placeholder_client_secret_9988qQ",
  paypalEnvironment: "sandbox",
  selectedGeminiModel: "gemini-3.5-flash",
  enableAutoSeoTags: true,
  enableAutoEditorialReview: false,
  defaultAuthorName: "Sarah Chen",
  defaultAuthorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
  analyticsId: "G-NEXUS2026",
  targetKeywords: "artificial intelligence, deep learning, micro-saas, productivity, automation, devops"
};

export function getWebsiteSettings(): WebsiteSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  const stored = localStorage.getItem('nexus_website_settings');
  if (!stored) return DEFAULT_SETTINGS;
  try {
    const parsed = JSON.parse(stored);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}

export function saveWebsiteSettings(settings: WebsiteSettings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('nexus_website_settings', JSON.stringify(settings));
  window.dispatchEvent(new Event('nexus_settings_changed'));
}
