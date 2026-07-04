/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { translations } from "../translations";
import { Mail, Phone, MapPin, Building2, ExternalLink } from "lucide-react";

interface FooterProps {
  currentLanguage: "hi" | "en";
  navigate: (page: string, slug?: string) => void;
}

export default function Footer({ currentLanguage, navigate }: FooterProps) {
  const t = translations[currentLanguage];

  return (
    <footer className="bg-brand-charcoal text-brand-cream border-t-8 border-brand-crimson mt-16 font-sans">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16 grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
        {/* About Section */}
        <div className="flex flex-col gap-4">
          <h3 className="text-xl font-bold font-serif text-brand-paper border-b border-brand-border/20 pb-2 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-brand-gold" />
            <span>{t.siteName}</span>
          </h3>
          <p className="text-brand-cream/80 text-sm leading-relaxed">
            {currentLanguage === "hi"
              ? "कोसी एजुकेशन टाइम्स बिहार के कोसी क्षेत्र (मधेपुरा, सहरसा, पूर्णिया, सुपौल) के स्कूलों का सम्मान करने वाला पहला द्विभाषी डिजिटल मंच है।"
              : "Kosi Education Times is the premier bilingual digital platform celebrating schools and educational excellence in the Kosi region of Bihar (Madhepura, Saharsa, Purnia, Supaul)."}
          </p>
          <div className="text-xs text-brand-cream/60 mt-2 font-mono">
            {t.byZera}
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col gap-4">
          <h3 className="text-xl font-bold font-serif text-brand-paper border-b border-brand-border/20 pb-2">
            {currentLanguage === "hi" ? "त्वरित लिंक" : "Quick Links"}
          </h3>
          <ul className="flex flex-col gap-2.5 text-sm">
            <li>
              <button
                onClick={() => navigate("home")}
                className="hover:text-brand-gold transition-colors text-left focus:outline-none"
              >
                &raquo; {t.navHome}
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("schools")}
                className="hover:text-brand-gold transition-colors text-left focus:outline-none"
              >
                &raquo; {t.navDirectory}
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("about")}
                className="hover:text-brand-gold transition-colors text-left focus:outline-none"
              >
                &raquo; {t.navAbout}
              </button>
            </li>
          </ul>
        </div>

        {/* Contact/Publisher info */}
        <div className="flex flex-col gap-4">
          <h3 className="text-xl font-bold font-serif text-brand-paper border-b border-brand-border/20 pb-2 flex items-center gap-2">
            <Phone className="w-5 h-5 text-brand-gold" />
            <span>{t.contactDetails}</span>
          </h3>
          <div className="flex flex-col gap-3 text-sm text-brand-cream/90">
            <div className="font-semibold text-brand-gold font-serif">
              {t.orgName}
            </div>
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
              <span className="leading-relaxed">{t.addressValue}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-brand-gold shrink-0" />
              <a href="tel:9835102324" className="hover:text-brand-gold transition-colors font-mono">
                +91 9835102324
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="bg-[#1f1a18] text-brand-cream/50 text-xs text-center py-6 border-t border-brand-border/10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>
            &copy; 2026 {t.siteName}. All Rights Reserved.
          </p>
          <p className="flex items-center gap-1">
            <span>{t.byZera}</span>
            <span className="text-brand-gold">|</span>
            <a
              href="https://zeratechnologies.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brand-gold transition-colors inline-flex items-center gap-0.5"
            >
              <span>Zera Technologies</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
