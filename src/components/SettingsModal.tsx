/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from "react";
import { translations } from "../translations";
import { X, Settings, Database, Sliders, RefreshCw, Info } from "lucide-react";
import { motion } from "motion/react";

interface SettingsModalProps {
  currentLanguage: "hi" | "en";
  isOpen: boolean;
  onClose: () => void;
  onSave: (stories: string, schools: string, media: string) => void;
}

export default function SettingsModal({
  currentLanguage,
  isOpen,
  onClose,
  onSave,
}: SettingsModalProps) {
  const t = translations[currentLanguage];

  const [storiesUrl, setStoriesUrl] = useState("");
  const [schoolsUrl, setSchoolsUrl] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");

  useEffect(() => {
    if (isOpen) {
      setStoriesUrl(localStorage.getItem("csv_stories_url") || "");
      setSchoolsUrl(localStorage.getItem("csv_schools_url") || "");
      setMediaUrl(localStorage.getItem("csv_media_url") || "");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    onSave(storiesUrl.trim(), schoolsUrl.trim(), mediaUrl.trim());
    onClose();
  };

  const handleReset = () => {
    localStorage.removeItem("csv_stories_url");
    localStorage.removeItem("csv_schools_url");
    localStorage.removeItem("csv_media_url");
    onSave("", "", "");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-charcoal/60 backdrop-blur-xs font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-2xl bg-brand-paper border-4 border-brand-charcoal rounded-xl shadow-2xl overflow-hidden"
      >
        {/* Modal Header */}
        <div className="bg-brand-charcoal text-brand-cream px-6 py-4 flex justify-between items-center border-b border-brand-charcoal">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-brand-gold animate-spin-slow" />
            <h2 className="text-lg font-bold font-serif">{t.settingsTitle}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-brand-cream/70 hover:text-brand-cream hover:bg-brand-paper/10 rounded-full transition-all focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSave} className="p-6 flex flex-col gap-5">
          <p className="text-sm text-brand-charcoal/80 leading-relaxed bg-brand-cream p-4 rounded-lg border border-brand-border">
            {t.settingsDesc}
          </p>

          <div className="flex flex-col gap-4">
            {/* Stories CSV */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-brand-charcoal flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-brand-crimson" />
                <span>{t.storiesUrl}</span>
              </label>
              <input
                type="url"
                value={storiesUrl}
                onChange={(e) => setStoriesUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/e/.../pub?output=csv (Default: /data/stories.csv)"
                className="w-full text-sm px-3 py-2.5 bg-brand-cream/50 border border-brand-border rounded-md focus:outline-none focus:border-brand-crimson focus:bg-brand-paper font-mono"
              />
            </div>

            {/* Schools CSV */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-brand-charcoal flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-brand-crimson" />
                <span>{t.schoolsUrl}</span>
              </label>
              <input
                type="url"
                value={schoolsUrl}
                onChange={(e) => setSchoolsUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/e/.../pub?output=csv (Default: /data/schools.csv)"
                className="w-full text-sm px-3 py-2.5 bg-brand-cream/50 border border-brand-border rounded-md focus:outline-none focus:border-brand-crimson focus:bg-brand-paper font-mono"
              />
            </div>

            {/* Media CSV */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-brand-charcoal flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-brand-crimson" />
                <span>{t.mediaUrl}</span>
              </label>
              <input
                type="url"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/e/.../pub?output=csv (Default: /data/media.csv)"
                className="w-full text-sm px-3 py-2.5 bg-brand-cream/50 border border-brand-border rounded-md focus:outline-none focus:border-brand-crimson focus:bg-brand-paper font-mono"
              />
            </div>
          </div>

          <div className="text-xs text-brand-charcoal/60 bg-brand-cream p-3 rounded border border-brand-border/40 flex items-start gap-2">
            <Info className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
            <span>{t.customUrlNote}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between gap-3 mt-4 pt-4 border-t border-brand-border">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 text-xs font-bold text-brand-crimson bg-brand-cream hover:bg-brand-crimson/10 border border-brand-crimson/20 rounded-md transition-all flex items-center justify-center gap-1.5 focus:outline-none"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{t.resetBtn}</span>
            </button>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-brand-charcoal/70 hover:text-brand-charcoal bg-brand-cream hover:bg-brand-border/30 rounded-md transition-all focus:outline-none"
              >
                {t.closeBtn}
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-brand-cream bg-brand-crimson hover:bg-brand-crimson/95 rounded-md shadow-xs hover:shadow-sm transition-all focus:outline-none flex items-center justify-center gap-1.5"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{t.saveBtn}</span>
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
