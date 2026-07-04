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
  onOpenSettings: () => void;
}

export default function Header({
  currentLanguage,
  setLanguage,
  currentRoute,
  navigate,
  onOpenSettings,
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
          <span>{t.byZera}</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1 hover:text-brand-gold transition-colors font-sans focus:outline-none cursor-pointer"
            aria-label="Configure CSV sources"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">CSV स्रोत / Settings</span>
          </button>
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
          <div className="hidden md:flex flex-col items-end border-l border-brand-border/60 pl-4 text-right">
            <span className="text-[10px] font-bold text-brand-charcoal/50 uppercase tracking-widest block">
              {currentLanguage === "hi" ? "डिजिटल पार्टनर" : "DIGITAL PARTNER"}
            </span>
            <span className="font-serif font-bold text-xs text-brand-crimson mt-0.5 block">
              ज़ेरा टेक्नोलॉजीज
            </span>
            <span className="text-[10px] text-brand-charcoal/50 font-sans block">
              Zera Technologies
            </span>
          </div>
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
              <button
                onClick={() => {
                  onOpenSettings();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 text-brand-charcoal hover:bg-brand-paper hover:text-brand-crimson flex items-center gap-2 rounded-md transition-all"
              >
                <Settings className="w-4 h-4" />
                <span>CSV डेटा स्रोत सेट करें</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
