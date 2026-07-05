/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { translations } from "../translations";
import { Menu, X, Settings, Globe } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface HeaderProps {
  currentLanguage: "hi" | "en";
  setLanguage: (lang: "hi" | "en") => void;
  currentRoute: { page: string; slug?: string };
  navigate: (page: string, slug?: string) => void;
}

export default function Header({
  currentLanguage,
  setLanguage,
  currentRoute,
  navigate,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = translations[currentLanguage];

  const navItems = [
    { id: "home", label: t.navHome },
    { id: "schools", label: t.navDirectory },
    { id: "about", label: t.navAbout },
  ];

  const handleNavClick = (pageId: string) => {
    navigate(pageId);
    setMobileMenuOpen(false);
  };

  const getFormattedDate = () => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date().toLocaleDateString(
      currentLanguage === "hi" ? "hi-IN" : "en-US",
      options
    );
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-brand-border bg-brand-paper shadow-xs">
      {/* Top micro bar for branding info */}
      <div className="bg-brand-charcoal text-brand-cream text-xs py-1.5 px-4 flex justify-between items-center">
        <div className="font-sans flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-brand-gold animate-pulse"></span>
          <a
            href="https://zeratech.io"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-brand-gold hover:underline transition-colors cursor-pointer"
          >
            {t.byZera}
          </a>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:block font-serif italic text-brand-gold/80 text-[11px] tracking-wide">
            {currentLanguage === "hi" ? "बिहार की शैक्षणिक चेतना का नया स्वर" : "The Voice of Educational Consciousness in Bihar"}
          </div>
        </div>
      </div>

      {/* Main Branding Header Section - Editorial Masthead */}
      <div className="max-w-7xl mx-auto px-4 py-5 border-b-3 border-double border-brand-charcoal/20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Left: Date Box */}
          <div className="hidden md:block text-left border-r border-brand-border/60 pr-4">
            <span className="text-[10px] font-bold text-brand-charcoal/50 uppercase tracking-widest block">
              {currentLanguage === "hi" ? "आज की तिथि" : "TODAY'S DATE"}
            </span>
            <span className="font-serif text-xs font-semibold text-brand-charcoal mt-0.5 block">
              {getFormattedDate()}
            </span>
          </div>

          {/* Center: Brand Identity */}
          <div className="text-center">
            <button
              onClick={() => handleNavClick("home")}
              className="group inline-block focus:outline-none cursor-pointer"
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-brand-crimson font-serif transition-colors group-hover:text-brand-charcoal">
                {t.siteName}
              </h1>
            </button>
            <div className="mt-1.5 text-xs sm:text-sm font-serif italic text-brand-charcoal/70 flex items-center justify-center gap-2">
              <span className="inline-block w-3 h-0.5 bg-brand-crimson"></span>
              <span>{t.tagline}</span>
              <span className="inline-block w-3 h-0.5 bg-brand-crimson"></span>
            </div>
          </div>

          {/* Right: Powered By and Desk Info */}
          <a
            href="https://zeratech.io"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex flex-col items-end border-l border-brand-border/60 pl-4 text-right hover:opacity-80 transition-opacity cursor-pointer group/zera"
          >
            <span className="text-[10px] font-bold text-brand-charcoal/50 uppercase tracking-widest block">
              {currentLanguage === "hi" ? "डिजिटल पार्टनर" : "DIGITAL PARTNER"}
            </span>
            <span className="font-serif font-bold text-xs text-brand-crimson mt-0.5 block group-hover/zera:underline">
              ज़ेरा टेक्नोलॉजीज
            </span>
            <span className="text-[10px] text-brand-charcoal/50 font-sans block group-hover/zera:underline">
              Zera Technologies
            </span>
          </a>
        </div>
      </div>

      {/* Navigation and Language Switcher */}
      <div className="bg-brand-paper">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex justify-between items-center">
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 font-sans font-semibold text-sm">
            {navItems.map((item) => {
              const isActive = currentRoute.page === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-4 py-2 rounded-md transition-all ${
                    isActive
                      ? "bg-brand-crimson text-brand-cream shadow-sm"
                      : "text-brand-charcoal hover:bg-brand-cream/80 hover:text-brand-crimson"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-brand-charcoal hover:text-brand-crimson focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Language Toggle switch */}
          <div className="flex items-center gap-2 border border-brand-border bg-brand-cream p-1 rounded-full">
            <Globe className="w-4 h-4 text-brand-charcoal/60 ml-2 hidden sm:inline" />
            <button
              onClick={() => setLanguage("hi")}
              className={`px-3 py-1 text-xs font-bold rounded-full transition-all focus:outline-none ${
                currentLanguage === "hi"
                  ? "bg-brand-crimson text-brand-cream shadow-xs"
                  : "text-brand-charcoal/70 hover:text-brand-crimson"
              }`}
            >
              हिंदी
            </button>
            <span className="text-brand-border font-light text-xs">|</span>
            <button
              onClick={() => setLanguage("en")}
              className={`px-3 py-1 text-xs font-bold rounded-full transition-all focus:outline-none ${
                currentLanguage === "en"
                  ? "bg-brand-crimson text-brand-cream shadow-xs"
                  : "text-brand-charcoal/70 hover:text-brand-crimson"
              }`}
            >
              English
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-brand-cream border-t border-brand-border overflow-hidden shadow-inner"
          >
            <div className="px-4 py-3 flex flex-col gap-2 font-sans font-bold text-sm">
              {navItems.map((item) => {
                const isActive = currentRoute.page === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full text-left px-4 py-2.5 rounded-md transition-all ${
                      isActive
                        ? "bg-brand-crimson text-brand-cream"
                        : "text-brand-charcoal hover:bg-brand-paper hover:text-brand-crimson"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
