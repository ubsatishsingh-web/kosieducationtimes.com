/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { School } from "../types";
import { translations } from "../translations";
import { MapPin, Phone, User, Globe2, Sparkles, ChevronRight } from "lucide-react";
import { motion } from "motion/react";

interface SchoolCardProps {
  school: School;
  currentLanguage: "hi" | "en";
  onSelect: (slug: string) => void;
  onContactRequest: (schoolName: string) => void;
}

export default function SchoolCard({
  school,
  currentLanguage,
  onSelect,
  onContactRequest,
}: SchoolCardProps) {
  const t = translations[currentLanguage];

  const name = currentLanguage === "hi" ? school.school_name_hi : school.school_name;
  const location = currentLanguage === "hi" ? school.location_hi : school.location;

  // Website Status Colors & Text
  const getStatusBadge = (status: string) => {
    const cleanStatus = status.toLowerCase().trim();
    if (cleanStatus === "completed" || cleanStatus === "active" || cleanStatus === "live") {
      return (
        <span className="inline-flex items-center gap-1 bg-brand-forest/10 border border-brand-forest/20 text-brand-forest text-[11px] font-sans font-bold px-2.5 py-1 rounded-md">
          <span className="w-1.5 h-1.5 bg-brand-forest rounded-full"></span>
          <span>{t.completed}</span>
        </span>
      );
    } else if (cleanStatus === "in progress" || cleanStatus === "pending" || cleanStatus === "building") {
      return (
        <span className="inline-flex items-center gap-1 bg-brand-gold/10 border border-brand-gold/20 text-brand-gold text-[11px] font-sans font-bold px-2.5 py-1 rounded-md">
          <span className="w-1.5 h-1.5 bg-brand-gold rounded-full"></span>
          <span>{t.inProgress}</span>
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 bg-brand-crimson/10 border border-brand-crimson/20 text-brand-crimson text-[11px] font-sans font-bold px-2.5 py-1 rounded-md">
          <span className="w-1.5 h-1.5 bg-brand-crimson rounded-full"></span>
          <span>{t.notStarted}</span>
        </span>
      );
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onClick={() => onSelect(school.slug)}
      className={`bg-brand-paper border-2 ${
        school.featured ? "border-brand-gold bg-[#fffdfa]" : "border-brand-border"
      } rounded-xl overflow-hidden shadow-xs hover:shadow-md hover:border-brand-crimson/50 transition-all flex flex-col h-full cursor-pointer group`}
    >
      {/* Featured Banner Accent */}
      {school.featured && (
        <div className="bg-brand-gold text-brand-paper text-[10px] font-bold py-1 px-3 flex items-center justify-center gap-1.5">
          <Sparkles className="w-3 h-3" />
          <span>{currentLanguage === "hi" ? "फ़ीचर्ड विद्यालय" : "Featured School"}</span>
        </div>
      )}

      {/* School Logo & Location Cover */}
      <div className="p-5 flex gap-4 items-start border-b border-brand-border">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-brand-cream border border-brand-border flex items-center justify-center overflow-hidden shrink-0">
          <img
            src={school.logo_url}
            alt={school.school_name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          {/* Location / District tag */}
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-crimson font-sans uppercase">
            <MapPin className="w-3 h-3" />
            <span>{location}</span>
          </span>
          <h3 className="text-base sm:text-lg font-bold font-serif text-brand-charcoal leading-tight group-hover:text-brand-crimson transition-colors">
            {name}
          </h3>
          <p className="text-xs text-brand-charcoal/60 font-sans line-clamp-1">
            {school.address}
          </p>
        </div>
      </div>

      {/* Details list */}
      <div className="p-5 flex flex-col gap-3.5 flex-1">
        <div className="flex flex-col gap-2.5 text-xs text-brand-charcoal/80 font-sans">
          {/* Contact Person */}
          <div className="flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-brand-charcoal/40 shrink-0" />
            <span>
              <span className="text-brand-charcoal/50 font-bold mr-1">{t.contactPerson}:</span>
              <span className="font-semibold text-brand-charcoal">{school.contact_person}</span>
            </span>
          </div>

          {/* Contact Phone */}
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-brand-charcoal/40 shrink-0" />
            <a
              href={`tel:${school.phone}`}
              onClick={(e) => e.stopPropagation()}
              className="font-mono font-semibold hover:text-brand-crimson transition-colors relative z-10"
            >
              {school.phone}
            </a>
          </div>

          {/* Website Status Indicator */}
          <div className="flex items-center gap-2 mt-1">
            <Globe2 className="w-3.5 h-3.5 text-brand-charcoal/40 shrink-0" />
            <div className="flex items-center gap-1.5">
              <span className="text-brand-charcoal/50 font-bold">{t.websiteStatusLabel}:</span>
              {getStatusBadge(school.website_status)}
            </div>
          </div>
        </div>

        {/* CTA Section & Actions */}
        <div className="mt-auto pt-4 flex flex-col gap-2">
          {/* View Profile Action */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(school.slug);
            }}
            className="w-full py-2.5 bg-brand-cream hover:bg-brand-crimson/10 text-brand-charcoal hover:text-brand-crimson border border-brand-border rounded-lg text-xs font-bold transition-all focus:outline-none flex items-center justify-center gap-1"
          >
            <span>{t.viewProfile}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Zera Tech website builder proposal button */}
          <a
            href="https://zeratech.io"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="w-full py-2 bg-[#fdfaf2] hover:bg-brand-gold/15 text-brand-terracotta border border-brand-terracotta/20 hover:border-brand-gold rounded-lg text-[11px] font-bold transition-all focus:outline-none flex items-center justify-center gap-1 text-center relative z-10"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-gold animate-pulse shrink-0" />
            <span className="truncate">{t.getWebsite}</span>
          </a>
        </div>
      </div>
    </motion.div>
  );
}
