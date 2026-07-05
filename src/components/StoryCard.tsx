/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Story } from "../types";
import { translations } from "../translations";
import { Calendar, Tag, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

interface StoryCardProps {
  story: Story;
  currentLanguage: "hi" | "en";
  onSelect: (slug: string) => void;
}

export default function StoryCard({ story, currentLanguage, onSelect }: StoryCardProps) {
  const t = translations[currentLanguage];

  const title = currentLanguage === "hi" ? story.title_hi : story.title_en;
  const summary = currentLanguage === "hi" ? story.summary_hi : story.summary_en;

  // Render date nicely
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString(currentLanguage === "hi" ? "hi-IN" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      onClick={() => onSelect(story.slug)}
      className="bg-brand-paper border-2 border-brand-border rounded-xl overflow-hidden shadow-xs hover:shadow-md hover:border-brand-crimson/50 transition-all flex flex-col h-full group cursor-pointer"
    >
      {/* Cover Image Container */}
      <div className="relative aspect-video overflow-hidden bg-brand-cream border-b border-brand-border">
        <img
          src={story.cover_image_url}
          alt={title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
          loading="lazy"
        />
        {/* Category tag */}
        <div className="absolute top-3 left-3 bg-brand-crimson text-brand-cream text-[11px] font-sans font-bold px-2.5 py-1 rounded-md shadow-xs flex items-center gap-1">
          <Tag className="w-3 h-3" />
          <span>{story.category}</span>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-5 flex flex-col flex-1 gap-3">
        {/* Publish Date */}
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-brand-charcoal/60 font-sans">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatDate(story.date)}</span>
        </div>

        {/* Story Title */}
        <h3 className="text-lg font-bold font-serif text-brand-charcoal leading-snug group-hover:text-brand-crimson transition-colors line-clamp-2">
          {title}
        </h3>

        {/* Short Summary */}
        <p className="text-xs sm:text-sm text-brand-charcoal/70 leading-relaxed font-sans line-clamp-3">
          {summary}
        </p>

        {/* Push to bottom spacer */}
        <div className="mt-auto pt-2 flex justify-between items-center">
          <span className="text-[11px] font-sans font-bold text-brand-charcoal/50">
            {story.school_name}
          </span>
          <button
            onClick={() => onSelect(story.slug)}
            className="text-xs font-bold text-brand-crimson flex items-center gap-1 hover:text-brand-charcoal transition-all group/btn focus:outline-none"
          >
            <span>{t.readFullStory}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </motion.article>
  );
}
