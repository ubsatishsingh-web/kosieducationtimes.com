/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { translations } from "../translations";
import { Award, BookOpen, ChevronRight, MapPin } from "lucide-react";
import { motion } from "motion/react";

interface HeroProps {
  currentLanguage: "hi" | "en";
  onSelectDistrict: (district: string) => void;
  navigate: (page: string, slug?: string) => void;
}

export default function Hero({ currentLanguage, onSelectDistrict, navigate }: HeroProps) {
  const t = translations[currentLanguage];

  const districts = [
    { id: "Madhepura", hi: "मधेपुरा", en: "Madhepura" },
    { id: "Saharsa", hi: "सहरसा", en: "Saharsa" },
    { id: "Purnia", hi: "पूर्णिया", en: "Purnia" },
    { id: "Supaul", hi: "सुपौल", en: "Supaul" },
  ];

  const handleDistrictClick = (districtId: string) => {
    onSelectDistrict(districtId);
    navigate("schools");
  };

  return (
    <div className="relative overflow-hidden bg-brand-paper border-b-4 border-brand-charcoal py-12 sm:py-20 px-4">
      {/* Decorative Traditional Border Background Elements */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-crimson via-brand-gold to-brand-forest"></div>
      
      {/* Editorial Content Layout */}
      <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col items-center">
        {/* Newspaper Stamp Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6 inline-flex items-center gap-1.5 px-3 py-1 bg-brand-crimson/10 border border-brand-crimson/20 rounded-full text-brand-crimson font-sans font-bold text-xs"
        >
          <Award className="w-4 h-4 text-brand-gold" />
          <span>{currentLanguage === "hi" ? "सच्ची ख़बर, स्कूलों का सम्मान" : "True Stories, Deserved Recognition"}</span>
        </motion.div>

        {/* Elegant Display Tagline Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-brand-charcoal leading-tight font-serif tracking-tight"
        >
          {currentLanguage === "hi" ? (
            <>
              कोसी क्षेत्र के स्कूलों का <span className="text-brand-crimson newspaper-underline-double">सम्मान</span> और पहचान
            </>
          ) : (
            <>
              Celebrating & Empowering the <span className="text-brand-crimson newspaper-underline-double">Schools</span> of Kosi Region
            </>
          )}
        </motion.h2>

        {/* Informative Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 text-base sm:text-lg md:text-xl text-brand-charcoal/80 max-w-2xl font-serif leading-relaxed"
        >
          {currentLanguage === "hi"
            ? "मधेपुरा, सहरसा, पूर्णिया और सुपौल जिलों की शैक्षिक उपलब्धियों, कर्मठ शिक्षकों और होनहार बच्चों के अनूठे प्रयासों का स्वतंत्र मंच।"
            : "An independent platform highlighting the unique efforts, scholastic triumphs, and digital transitions of rural and urban educational centers across Bihar."}
        </motion.p>

        {/* Clickable District Badges / Pills */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 w-full"
        >
          <div className="text-xs font-sans font-extrabold uppercase tracking-wider text-brand-charcoal/60 mb-3 flex items-center justify-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-brand-crimson" />
            <span>{currentLanguage === "hi" ? "अपने जिले के स्कूल देखें" : "Explore Schools by District"}</span>
          </div>
          <div className="flex flex-wrap justify-center gap-2 max-w-xl mx-auto">
            {districts.map((district) => (
              <button
                key={district.id}
                onClick={() => handleDistrictClick(district.id)}
                className="px-4 py-2 bg-brand-cream hover:bg-brand-crimson hover:text-brand-cream border border-brand-border hover:border-brand-crimson rounded-lg text-sm font-semibold transition-all shadow-2xs hover:shadow-sm focus:outline-none flex items-center gap-1"
              >
                <span>{currentLanguage === "hi" ? district.hi : district.en}</span>
                <ChevronRight className="w-3 h-3 opacity-60" />
              </button>
            ))}
          </div>
        </motion.div>

        {/* CTA Banner section inside Hero */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 bg-brand-cream border border-brand-border/80 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-center gap-4 max-w-2xl w-full"
        >
          <div className="flex items-center gap-3 text-left">
            <div className="p-2.5 bg-brand-crimson text-brand-cream rounded-lg shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-brand-charcoal leading-snug">
                {currentLanguage === "hi" ? "स्कूल डायरेक्टरी २०२६" : "School Directory 2026"}
              </h4>
              <p className="text-xs font-sans text-brand-charcoal/70 mt-0.5">
                {currentLanguage === "hi"
                  ? "सभी पंजीकृत स्कूलों की सूची, विवरण और संपर्क जानकारी देखें।"
                  : "Explore addresses, school gallery portfolios, and phone directories."}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("schools")}
            className="px-4 py-2 bg-brand-crimson hover:bg-brand-charcoal text-brand-cream font-bold text-xs rounded-md shadow-xs hover:shadow-sm transition-all focus:outline-none flex items-center gap-1 cursor-pointer shrink-0"
          >
            <span>{currentLanguage === "hi" ? "डायरेक्टरी खोलें" : "View Directory"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}

// Inline replacement for missing ArrowRight inside this scope
function ArrowRight(props: any) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.5"
      viewBox="0 0 24 24"
      className={props.className}
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}
