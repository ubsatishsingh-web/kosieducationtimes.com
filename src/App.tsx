/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from "react";
import { Story, School, Media, Language } from "./types";
import { translations } from "./translations";
import { parseStoriesCSV, parseSchoolsCSV, parseMediaCSV } from "./utils";

import Header from "./components/Header";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import StoryCard from "./components/StoryCard";
import SchoolCard from "./components/SchoolCard";
import urlConfig from "./urls.json";

import {
  Calendar,
  MapPin,
  Phone,
  User,
  Globe,
  Tag,
  ChevronLeft,
  BookOpen,
  Award,
  Sparkles,
  Database,
  Search,
  Building2,
  Clock,
  ExternalLink,
  Info,
  Settings,
  ChevronDown,
  ChevronUp,
  Check,
  Copy,
  Trash2,
  Send
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface RouteState {
  page: "home" | "stories" | "story" | "schools" | "school" | "about";
  slug?: string;
  prefill?: string;
}

function linkifyZera(text: string, isLightBg = false) {
  const regex = /(Zera Technologies|ज़ीरा टेक्नोलॉजीज|ज़ेरा टेक्नोलॉजीज)/g;
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, index) => {
        if (part.match(regex)) {
          return (
            <a
              key={index}
              href="https://zeratech.io"
              target="_blank"
              rel="noopener noreferrer"
              className={
                isLightBg
                  ? "text-brand-crimson font-bold hover:underline cursor-pointer"
                  : "text-brand-gold font-bold hover:underline hover:text-brand-paper transition-all cursor-pointer"
              }
            >
              {part}
            </a>
          );
        }
        return part;
      })}
    </>
  );
}

export default function App() {
  // Language State - default is Hindi as requested
  const [currentLanguage, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("preferred_language");
    return (saved === "en" || saved === "hi") ? saved : "hi";
  });

  // UI state
  const [districtFilter, setDistrictFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Data State
  const [stories, setStories] = useState<Story[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Router State
  const [route, setRoute] = useState<RouteState>({ page: "home" });

  // Update language preference in localStorage
  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("preferred_language", lang);
  };

  // Parsing Route from Hash
  const getRouteFromHash = (): RouteState => {
    const hash = window.location.hash;
    if (hash.startsWith("#/story/")) {
      return { page: "story", slug: hash.replace("#/story/", "") };
    }
    if (hash.startsWith("#/school/")) {
      return { page: "school", slug: hash.replace("#/school/", "") };
    }
    if (hash === "#/schools") {
      return { page: "schools" };
    }
    if (hash.startsWith("#/about")) {
      const parts = hash.split("?");
      let prefill: string | undefined;
      if (parts[1]) {
        const match = parts[1].match(/prefill=([^&]+)/);
        if (match) {
          prefill = decodeURIComponent(match[1]);
        }
      }
      return { page: "about", prefill };
    }
    return { page: "home" };
  };

  // Handle manual navigation
  const navigate = (page: string, slug?: string) => {
    if (page === "home") {
      window.location.hash = "";
      if (typeof window !== "undefined" && window.history && window.history.replaceState) {
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    }
    else if (page === "schools") window.location.hash = "#/schools";
    else if (page === "about") {
      window.location.hash = slug ? `#/about?prefill=${encodeURIComponent(slug)}` : "#/about";
    }
    else if (page === "story" && slug) window.location.hash = `#/story/${slug}`;
    else if (page === "school" && slug) window.location.hash = `#/school/${slug}`;
  };

  // Dynamic Data fetching
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const storiesUrl = urlConfig.storiesUrl || localStorage.getItem("csv_stories_url") || "/data/stories.csv";
      const schoolsUrl = urlConfig.schoolsUrl || localStorage.getItem("csv_schools_url") || "/data/schools.csv";
      const mediaUrl = urlConfig.mediaUrl || localStorage.getItem("csv_media_url") || "/data/media.csv";

      const fetchCSV = async (url: string, fallbackUrl: string): Promise<string> => {
        try {
          const res = await fetch(url);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return await res.text();
        } catch (err) {
          console.warn(`Fetch to ${url} failed. Trying fallback ${fallbackUrl}`, err);
          if (url !== fallbackUrl) {
            const res = await fetch(fallbackUrl);
            if (!res.ok) throw new Error(`Fallback HTTP ${res.status}`);
            return await res.text();
          }
          throw err;
        }
      };

      const [storiesText, schoolsText, mediaText] = await Promise.all([
        fetchCSV(storiesUrl, "/data/stories.csv"),
        fetchCSV(schoolsUrl, "/data/schools.csv"),
        fetchCSV(mediaUrl, "/data/media.csv")
      ]);

      const parsedStories = parseStoriesCSV(storiesText);
      const parsedSchools = parseSchoolsCSV(schoolsText);
      const parsedMedia = parseMediaCSV(mediaText);

      setStories(parsedStories);
      setSchools(parsedSchools);
      setMedia(parsedMedia);
    } catch (err: any) {
      console.error("Critical error in data fetch:", err);
      setError(err?.message || "Failed to parse database CSV feeds.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on boot or when configured URLs change
  useEffect(() => {
    // Sync URLs from localStorage to server urls.json if they differ and exist
    const syncUrlsWithServer = async () => {
      const localStories = localStorage.getItem("csv_stories_url") || "";
      const localSchools = localStorage.getItem("csv_schools_url") || "";
      const localMedia = localStorage.getItem("csv_media_url") || "";

      if (
        (localStories && localStories !== urlConfig.storiesUrl) ||
        (localSchools && localSchools !== urlConfig.schoolsUrl) ||
        (localMedia && localMedia !== urlConfig.mediaUrl)
      ) {
        try {
          await fetch("/api/sync-urls", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              storiesUrl: localStories,
              schoolsUrl: localSchools,
              mediaUrl: localMedia,
            }),
          });
          console.log("Successfully synced Google Sheet CSV URLs to server config!");
        } catch (e) {
          console.error("Failed to sync Google Sheet URLs to server:", e);
        }
      }
    };
    syncUrlsWithServer();

    fetchData();

    // Listen to hash routes
    const handleHashChange = () => {
      setRoute(getRouteFromHash());
      window.scrollTo({ top: 0, behavior: "smooth" });

      // Clean up trailing '#' from address bar if on home page
      if (window.location.hash === "" && window.history && window.history.replaceState) {
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    // Initial route check
    handleHashChange();

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

    // Dynamic Page Metadata (SEO & Social Sharing Preview)
    useEffect(() => {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://www.kosieducationtimes.com";
      let title = currentLanguage === "hi" ? "कोसी एजुकेशन टाइम्स | Kosi Education Times" : "Kosi Education Times | Celebrating Kosi Schools";
    let desc = currentLanguage === "hi" 
      ? "कोसी क्षेत्र (मधेपुरा, सहरसा, पूर्णिया, सुपौल) के स्कूलों, शिक्षकों और शिक्षा जगत की उपलब्धियों, नवाचारों और समाचारों को समर्पित एक प्रमुख द्विभाषी मीडिया मंच।"
      : "Kosi Education Times is a premier bilingual media platform celebrating achievements, innovations, and news of schools in Bihar.";
    let image = `${baseUrl}/kosi_edu_banner.jpg`;

    if (route.page === "story" && route.slug) {
      const activeStory = stories.find(s => s.slug === route.slug);
      if (activeStory) {
        title = currentLanguage === "hi" ? `${activeStory.title_hi} - कोसी एजुकेशन टाइम्स` : `${activeStory.title_en} - Kosi Education Times`;
        desc = currentLanguage === "hi" ? activeStory.summary_hi : activeStory.summary_en;
        if (activeStory.cover_image_url) {
          image = activeStory.cover_image_url.startsWith("http")
            ? activeStory.cover_image_url
            : `${baseUrl}${activeStory.cover_image_url.startsWith("/") ? "" : "/"}${activeStory.cover_image_url}`;
        }
      }
    } else if (route.page === "school" && route.slug) {
      const activeSchool = schools.find(s => s.slug === route.slug);
      if (activeSchool) {
        title = currentLanguage === "hi" ? `${activeSchool.school_name_hi} - स्कूल प्रोफ़ाइल` : `${activeSchool.school_name} - School Profile`;
        desc = currentLanguage === "hi" 
          ? `${activeSchool.school_name_hi}, ${activeSchool.location_hi} की प्रोफ़ाइल और विवरण। कोसी एजुकेशन टाइम्स पर देखें।`
          : `Profile and details of ${activeSchool.school_name}, ${activeSchool.location} on Kosi Education Times.`;
        if (activeSchool.logo_url) {
          image = activeSchool.logo_url.startsWith("http")
            ? activeSchool.logo_url
            : `${baseUrl}${activeSchool.logo_url.startsWith("/") ? "" : "/"}${activeSchool.logo_url}`;
        }
      }
    } else if (route.page === "schools") {
      title = currentLanguage === "hi" ? "स्कूल डायरेक्टरी - कोसी एजुकेशन टाइम्स" : "School Directory - Kosi Education Times";
    } else if (route.page === "about") {
      title = currentLanguage === "hi" ? "हमारे बारे में - कोसी एजुकेशन टाइम्स" : "About Us - Kosi Education Times";
    }

    // Update document title
    document.title = title;

    // Helper function to update or create meta tags safely
    const updateMetaTag = (selector: string, attr: string, value: string) => {
      try {
        let element = document.querySelector(selector);
        if (!element) {
          element = document.createElement("meta");
          const matches = selector.match(/\[(name|property)="([^"]+)"\]/);
          if (matches && matches[1] && matches[2]) {
            element.setAttribute(matches[1], matches[2]);
          }
          document.head.appendChild(element);
        }
        element.setAttribute(attr, value);
      } catch (e) {
        console.error("Failed to update meta tag:", selector, e);
      }
    };

    // Update Meta Tags
    updateMetaTag('meta[name="description"]', 'content', desc);
    updateMetaTag('meta[name="title"]', 'content', title);
    
    // Open Graph
    updateMetaTag('meta[property="og:title"]', 'content', title);
    updateMetaTag('meta[property="og:description"]', 'content', desc);
    updateMetaTag('meta[property="og:image"]', 'content', image);
    
    // Twitter
    updateMetaTag('meta[property="twitter:title"]', 'content', title);
    updateMetaTag('meta[property="twitter:description"]', 'content', desc);
    updateMetaTag('meta[property="twitter:image"]', 'content', image);
  }, [route, stories, schools, currentLanguage]);

  // Triggered when a school's digital consultation CTA is clicked
  const handleContactPrefill = (schoolName: string) => {
    navigate("about", schoolName);
  };

  const t = translations[currentLanguage];

  // Filter metrics
  const publishedStories = stories.filter(s => s.status === "published");
  const filteredSchools = schools.filter(s => {
    const matchesDistrict = districtFilter === "All" || s.location.toLowerCase() === districtFilter.toLowerCase();
    const nameMatch = currentLanguage === "hi" ? s.school_name_hi : s.school_name;
    const matchesSearch = nameMatch.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDistrict && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-brand-cream flex flex-col selection:bg-brand-crimson selection:text-brand-cream">
      {/* Dynamic Navigation Header */}
      <Header
        currentLanguage={currentLanguage}
        setLanguage={handleSetLanguage}
        currentRoute={route}
        navigate={navigate}
      />

      {/* Main Layout Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {loading ? (
            /* Traditional editorial loading skeletal state */
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 gap-4"
            >
              <div className="w-12 h-12 border-4 border-brand-crimson border-t-transparent rounded-full animate-spin"></div>
              <p className="font-serif italic text-brand-charcoal/70 text-lg">
                {t.loading}
              </p>
            </motion.div>
          ) : error ? (
            /* Custom database fetch error message screen */
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-md mx-auto text-center py-16 bg-brand-paper border-2 border-brand-crimson rounded-xl p-8 shadow-md"
            >
              <Database className="w-16 h-16 text-brand-crimson mx-auto mb-4" />
              <h3 className="text-xl font-bold font-serif mb-2">डेटाबेस लोड विफलता</h3>
              <p className="text-sm text-brand-charcoal/80 mb-6 font-sans">
                {error}
              </p>
              <button
                onClick={fetchData}
                className="px-5 py-2.5 bg-brand-crimson text-brand-cream font-bold rounded-md hover:bg-brand-charcoal transition-colors focus:outline-none"
              >
                पुनः प्रयास करें / Retry
              </button>
            </motion.div>
          ) : (
            /* Subpages */
            <motion.div
              key={route.page}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {/* PAGE 1: HOME */}
              {route.page === "home" && (
                <div className="flex flex-col gap-12 sm:gap-16">
                  {/* Hero banner */}
                  <Hero
                    currentLanguage={currentLanguage}
                    onSelectDistrict={(dist) => setDistrictFilter(dist)}
                    navigate={navigate}
                  />

                  {/* Core News Feed Row (2/3 Grid layout) */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Featured Stories Block */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                      <div className="border-b-2 border-brand-charcoal pb-2 flex justify-between items-center">
                        <h2 className="text-2xl sm:text-3xl font-extrabold font-serif tracking-tight text-brand-charcoal flex items-center gap-2">
                          <span className="w-1.5 h-7 bg-brand-crimson inline-block"></span>
                          <span>{t.featuredStories}</span>
                        </h2>
                      </div>

                      {publishedStories.length === 0 ? (
                        <p className="font-serif italic text-brand-charcoal/60 bg-brand-paper border border-brand-border rounded-xl p-8 text-center shadow-2xs">
                          {t.noStories}
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          {publishedStories.slice(0, 4).map((story) => (
                            <StoryCard
                              key={story.id}
                              story={story}
                              currentLanguage={currentLanguage}
                              onSelect={(slug) => navigate("story", slug)}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Regional Spotlight Sidebar */}
                    <div className="flex flex-col gap-6">
                      {/* Zera Tech Promotional Box */}
                      <div className="bg-brand-charcoal text-brand-cream border-t-8 border-brand-gold rounded-xl p-6 shadow-sm flex flex-col gap-4 font-sans">
                        <div className="flex items-center gap-1.5 text-brand-gold font-bold text-xs uppercase tracking-wider">
                          <Sparkles className="w-4 h-4 animate-pulse" />
                          <span>डिजिटल बिहार मिशन</span>
                        </div>
                        <h3 className="text-xl font-bold font-serif text-brand-paper leading-tight">
                          {currentLanguage === "hi"
                            ? "अपने स्कूल को डिजिटल बनाएं"
                            : "Take Your School Online"}
                        </h3>
                        <p className="text-xs sm:text-sm text-brand-cream/80 leading-relaxed">
                          {linkifyZera(
                            currentLanguage === "hi"
                              ? "ज़ीरा टेक्नोलॉजीज बिहार के स्कूलों को बेहतरीन और सुरक्षित वेबसाइट प्रदान करता है। आज ही संपर्क कर आधुनिक तकनीकों से जुड़ें।"
                              : "Zera Technologies develops modern, mobile-friendly websites for schools across Purnia division and Kosi region at low costs."
                          )}
                        </p>
                        <a
                          href="https://zeratech.io"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full mt-2 py-2.5 bg-brand-gold hover:bg-brand-paper text-brand-charcoal font-bold text-xs rounded-lg transition-colors focus:outline-none text-center block"
                        >
                          {t.getWebsite}
                        </a>
                      </div>

                      {/* Editorial board desk note */}
                      <div className="bg-brand-paper border border-brand-border rounded-xl p-6 shadow-2xs flex flex-col gap-3 font-sans">
                        <h4 className="font-bold text-sm text-brand-crimson font-serif uppercase tracking-wider flex items-center gap-1">
                          <Award className="w-4 h-4" />
                          <span>संपादकीय संदेश / Editorial note</span>
                        </h4>
                        <p className="text-xs text-brand-charcoal/80 leading-relaxed italic">
                          {currentLanguage === "hi"
                            ? "\"बिहार के सुदूर ग्रामीण क्षेत्रों के स्कूलों की सकारात्मक कहानियों और शैक्षणिक सुधारों को मुख्यधारा में लाना हमारा संकल्प है। हम कोसी के शिक्षकों के जज्बे को सलाम करते हैं।\""
                            : "\"Bringing forward positive news stories and modernizing educational portals across rural Bihar is our pledge. We salute the grit of Kosi's teachers.\""}
                        </p>
                        <div className="text-[11px] font-bold text-brand-charcoal/60 mt-1">
                          — कोसी एजुकेशन टाइम्स डेस्क, मधेपुरा
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Featured Schools Grid */}
                  <div className="flex flex-col gap-6">
                    <div className="border-b-2 border-brand-charcoal pb-2">
                      <h2 className="text-2xl sm:text-3xl font-extrabold font-serif tracking-tight text-brand-charcoal flex items-center gap-2">
                        <span className="w-1.5 h-7 bg-brand-gold inline-block"></span>
                        <span>{t.featuredSchools}</span>
                      </h2>
                    </div>

                    {schools.filter(s => s.featured).length === 0 ? (
                      <p className="font-serif italic text-brand-charcoal/60 bg-brand-paper border border-brand-border rounded-xl p-8 text-center shadow-2xs">
                        {t.noSchools}
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {schools
                          .filter((s) => s.featured)
                          .slice(0, 3)
                          .map((school) => (
                            <SchoolCard
                              key={school.id}
                              school={school}
                              currentLanguage={currentLanguage}
                              onSelect={(slug) => navigate("school", slug)}
                              onContactRequest={handleContactPrefill}
                            />
                          ))}
                      </div>
                    )}

                    {/* Navigation helper block */}
                    <div className="text-center mt-4">
                      <button
                        onClick={() => navigate("schools")}
                        className="inline-flex items-center gap-1 px-6 py-3 bg-brand-charcoal text-brand-cream font-bold rounded-lg shadow-xs hover:bg-brand-crimson transition-all focus:outline-none font-sans text-sm cursor-pointer"
                      >
                        <span>{currentLanguage === "hi" ? "सभी विद्यालय डायरेक्टरी देखें" : "Browse Full School Directory"}</span>
                        <span>&raquo;</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* PAGE 2: STORY DETAIL VIEW */}
              {route.page === "story" && (() => {
                const story = stories.find((s) => s.slug === route.slug);
                if (!story) {
                  return (
                    <div className="text-center py-16 bg-brand-paper border border-brand-border rounded-xl p-8 max-w-md mx-auto shadow-2xs">
                      <p className="font-serif text-brand-charcoal/60 text-lg mb-4">
                        समाचार नहीं मिला। / Story not found.
                      </p>
                      <button
                        onClick={() => navigate("home")}
                        className="px-4 py-2 bg-brand-crimson text-brand-cream rounded-md"
                      >
                        {t.backToHome}
                      </button>
                    </div>
                  );
                }

                const school = schools.find(
                  (sch) => sch.school_name.toLowerCase() === story.school_name.toLowerCase() ||
                           sch.school_name_hi === story.school_name
                );

                const title = currentLanguage === "hi" ? story.title_hi : story.title_en;
                const body = currentLanguage === "hi" ? story.body_hi : story.body_en;
                const summary = currentLanguage === "hi" ? story.summary_hi : story.summary_en;

                const storyMedia = media.filter(m => m.linked_story_id === story.id);

                return (
                  <div className="flex flex-col gap-8 sm:gap-10">
                    {/* Back header navigation */}
                    <button
                      onClick={() => navigate("home")}
                      className="self-start inline-flex items-center gap-1 text-xs font-bold text-brand-crimson hover:text-brand-charcoal bg-brand-paper border border-brand-border px-3 py-1.5 rounded-lg shadow-2xs focus:outline-none transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>{t.backToHome}</span>
                    </button>

                    {/* Editorial Story Header Card */}
                    <div className="bg-brand-paper border-4 border-brand-charcoal rounded-xl overflow-hidden shadow-md">
                      <div className="p-6 sm:p-10 border-b border-brand-border flex flex-col gap-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="bg-brand-crimson text-brand-cream text-xs font-bold px-3 py-1 rounded-md shadow-2xs flex items-center gap-1">
                            <Tag className="w-3.5 h-3.5" />
                            <span>{story.category}</span>
                          </span>
                          <span className="text-xs font-semibold text-brand-charcoal/50 font-sans flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{t.publishedOn}: {story.date}</span>
                          </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-serif text-brand-charcoal leading-tight">
                          {title}
                        </h1>
                        <p className="text-sm sm:text-base text-brand-charcoal/70 leading-relaxed font-serif italic border-l-4 border-brand-gold pl-4 mt-2">
                          {summary}
                        </p>
                      </div>

                      {/* Cover Photo */}
                      <div className="w-full aspect-[21/9] overflow-hidden bg-brand-cream border-b border-brand-border">
                        <img
                          src={story.cover_image_url}
                          alt={title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Content block row */}
                      <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12">
                        {/* Body text columns */}
                        <div className="lg:col-span-2 flex flex-col gap-4 text-base leading-relaxed text-brand-charcoal/90 font-sans">
                          {body.split("\n").map((para, idx) => (
                            <p key={idx} className="mb-4 whitespace-pre-line">
                              {para.trim()}
                            </p>
                          ))}

                          {/* Related Media Gallery inside story */}
                          {storyMedia.length > 0 && (
                            <div className="mt-8 pt-8 border-t border-brand-border">
                              <h3 className="text-lg font-bold font-serif text-brand-charcoal mb-4 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-brand-gold" />
                                <span>{currentLanguage === "hi" ? "संबंधित चित्र एवं फोटो" : "Related Media Gallery"}</span>
                              </h3>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {storyMedia.map((m) => (
                                  <div key={m.id} className="bg-brand-cream border border-brand-border rounded-lg p-2.5 flex flex-col gap-2">
                                    <div className="aspect-video overflow-hidden rounded-md border border-brand-border bg-brand-paper">
                                      <img
                                        src={m.image_url}
                                        alt={currentLanguage === "hi" ? m.caption_hi : m.caption_en}
                                        referrerPolicy="no-referrer"
                                        className="w-full h-full object-cover hover:scale-103 transition-transform duration-300"
                                      />
                                    </div>
                                    <p className="text-xs text-brand-charcoal/70 font-sans leading-relaxed text-center font-semibold">
                                      {currentLanguage === "hi" ? m.caption_hi : m.caption_en}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Sidebar: More about this school box */}
                        <div className="flex flex-col gap-6">
                          {school ? (
                            <div className="bg-brand-cream border-2 border-brand-charcoal rounded-xl p-5 shadow-2xs flex flex-col gap-4 font-sans">
                              <h4 className="font-bold text-sm text-brand-crimson font-serif uppercase tracking-wider border-b border-brand-border pb-2">
                                {t.moreAboutSchool}
                              </h4>
                              <div className="flex gap-3 items-center">
                                <div className="w-12 h-12 rounded-lg bg-brand-paper border border-brand-border overflow-hidden shrink-0 flex items-center justify-center">
                                  <img
                                    src={school.logo_url}
                                    alt={school.school_name}
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div>
                                  <h5 className="font-bold text-sm text-brand-charcoal font-serif">
                                    {currentLanguage === "hi" ? school.school_name_hi : school.school_name}
                                  </h5>
                                  <p className="text-xs text-brand-charcoal/60 mt-0.5">
                                    {school.address}
                                  </p>
                                </div>
                              </div>
                              <div className="text-xs flex flex-col gap-1.5 text-brand-charcoal/80 border-t border-brand-border pt-3">
                                <div className="flex items-center gap-1.5">
                                  <MapPin className="w-3.5 h-3.5 text-brand-crimson shrink-0" />
                                  <span>{currentLanguage === "hi" ? school.location_hi : school.location}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Phone className="w-3.5 h-3.5 text-brand-charcoal/50 shrink-0" />
                                  <a href={`tel:${school.phone}`} className="font-mono hover:text-brand-crimson transition-colors">{school.phone}</a>
                                </div>
                              </div>
                              <button
                                onClick={() => navigate("school", school.slug)}
                                className="w-full py-2 bg-brand-crimson text-brand-cream hover:bg-brand-charcoal rounded-lg text-xs font-bold transition-all mt-2 focus:outline-none"
                              >
                                {t.viewProfile}
                              </button>
                            </div>
                          ) : (
                            <div className="bg-brand-cream border border-brand-border rounded-xl p-5 shadow-2xs flex flex-col gap-3 font-sans">
                              <h4 className="font-bold text-sm text-brand-crimson font-serif uppercase tracking-wider border-b border-brand-border pb-1.5">
                                {t.siteName}
                              </h4>
                              <p className="text-xs text-brand-charcoal/70 leading-relaxed">
                                {currentLanguage === "hi"
                                  ? "यह समाचार कोसी क्षेत्र की शैक्षणिक प्रगति को दर्शाता है। अपने विद्यालय की सफलताओं को यहाँ साझा करने के लिए आज ही संपर्क करें।"
                                  : "This news item highlights educational progress in rural Bihar. Share your school's success stories with us."}
                              </p>
                              <button
                                onClick={() => navigate("about")}
                                className="w-full py-2 bg-brand-crimson text-brand-cream hover:bg-brand-charcoal rounded-lg text-xs font-bold transition-all focus:outline-none mt-1"
                              >
                                {t.contactUs}
                              </button>
                            </div>
                          )}

                          {/* Digital website building consultation CTA banner */}
                          <div className="bg-brand-paper border border-brand-gold bg-[#fffdfa] rounded-xl p-5 shadow-2xs flex flex-col gap-3 font-sans">
                            <div className="flex items-center gap-1 text-brand-gold font-bold text-[10px] uppercase tracking-wider">
                              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                              <span>वेबसाइट निर्माण</span>
                            </div>
                            <h4 className="font-bold text-sm text-brand-charcoal font-serif leading-snug">
                              क्या आपका स्कूल डिजिटल है?
                            </h4>
                            <p className="text-xs text-brand-charcoal/70 leading-relaxed">
                              ज़ीरा टेक्नोलॉजीज द्वारा बहुत ही कम खर्च में अपने स्कूल के लिए अपनी खुद की वेबसाइट बनवाएं।
                            </p>
                            <button
                              onClick={() => handleContactPrefill(story.school_name)}
                              className="w-full py-2 bg-[#fdfaf2] text-brand-terracotta border border-brand-terracotta/30 rounded-lg text-xs font-bold hover:bg-brand-gold/15 transition-all focus:outline-none"
                            >
                              {t.getWebsite}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* PAGE 3: SCHOOL DIRECTORY */}
              {route.page === "schools" && (
                <div className="flex flex-col gap-10">
                  <div className="border-b-2 border-brand-charcoal pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h2 className="text-3xl font-extrabold font-serif tracking-tight text-brand-charcoal">
                        {t.navDirectory}
                      </h2>
                      <p className="text-xs sm:text-sm text-brand-charcoal/60 mt-1 font-serif">
                        {currentLanguage === "hi"
                          ? "मधेपुरा, सहरसा, पूर्णिया और सुपौल जिलों के शैक्षणिक संस्थानों की खोज करें।"
                          : "Explore and search educational institutions across Madhepura, Saharsa, Purnia & Supaul districts."}
                      </p>
                    </div>
                  </div>

                  {/* Search and Filters row */}
                  <div className="bg-brand-paper border-2 border-brand-border rounded-xl p-4 sm:p-5 shadow-2xs flex flex-col md:flex-row gap-4 items-center justify-between font-sans">
                    {/* Search Field */}
                    <div className="w-full md:max-w-md relative">
                      <Search className="absolute left-3.5 top-3 w-4 h-4 text-brand-charcoal/40" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t.searchSchool}
                        className="w-full pl-10 pr-4 py-2 bg-brand-cream border border-brand-border rounded-lg text-sm focus:outline-none focus:border-brand-crimson focus:bg-brand-paper"
                      />
                    </div>

                    {/* District Selector pills */}
                    <div className="w-full md:w-auto flex flex-col sm:flex-row items-start sm:items-center gap-2.5 font-bold text-xs shrink-0">
                      <span className="text-brand-charcoal/60 uppercase">{t.districtFilter}:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {["All", "Madhepura", "Saharsa", "Purnia", "Supaul"].map((dist) => {
                          const label = dist === "All"
                            ? t.allDistricts
                            : currentLanguage === "hi"
                              ? (dist === "Madhepura" ? "मधेपुरा" : dist === "Saharsa" ? "सहरसा" : dist === "Purnia" ? "पूर्णिया" : "सुपौल")
                              : dist;
                          return (
                            <button
                              key={dist}
                              onClick={() => setDistrictFilter(dist)}
                              className={`px-3.5 py-1.5 rounded-md border transition-all cursor-pointer focus:outline-none ${
                                districtFilter.toLowerCase() === dist.toLowerCase()
                                  ? "bg-brand-crimson text-brand-cream border-brand-crimson shadow-2xs"
                                  : "bg-brand-cream text-brand-charcoal/80 border-brand-border hover:bg-brand-cream/60"
                              }`}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Results directory grid */}
                  {filteredSchools.length === 0 ? (
                    <div className="text-center py-16 bg-brand-paper border border-brand-border rounded-xl p-8 max-w-md mx-auto shadow-2xs">
                      <p className="font-serif italic text-brand-charcoal/60 text-lg mb-2">
                        {t.noSchools}
                      </p>
                      <button
                        onClick={() => { setSearchQuery(""); setDistrictFilter("All"); }}
                        className="text-xs font-bold text-brand-crimson underline"
                      >
                        फिल्टर साफ़ करें / Clear Filters
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredSchools.map((school) => (
                        <SchoolCard
                          key={school.id}
                          school={school}
                          currentLanguage={currentLanguage}
                          onSelect={(slug) => navigate("school", slug)}
                          onContactRequest={handleContactPrefill}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* PAGE 4: SCHOOL PROFILE VIEW */}
              {route.page === "school" && (() => {
                const school = schools.find((s) => s.slug === route.slug);
                if (!school) {
                  return (
                    <div className="text-center py-16 bg-brand-paper border border-brand-border rounded-xl p-8 max-w-md mx-auto shadow-2xs">
                      <p className="font-serif text-brand-charcoal/60 text-lg mb-4">
                        विद्यालय प्रोफ़ाइल नहीं मिली। / School profile not found.
                      </p>
                      <button
                        onClick={() => navigate("schools")}
                        className="px-4 py-2 bg-brand-crimson text-brand-cream rounded-md"
                      >
                        {t.backToDirectory}
                      </button>
                    </div>
                  );
                }

                const name = currentLanguage === "hi" ? school.school_name_hi : school.school_name;
                const location = currentLanguage === "hi" ? school.location_hi : school.location;

                // Find stories related to this school name
                const relatedStories = stories.filter(
                  (s) => s.school_name.toLowerCase() === school.school_name.toLowerCase() ||
                         s.school_name === school.school_name_hi
                );

                // Find linked media through stories
                const relatedStoryIds = relatedStories.map(s => s.id);
                const schoolMedia = media.filter(m => relatedStoryIds.includes(m.linked_story_id));

                return (
                  <div className="flex flex-col gap-8 sm:gap-10">
                    {/* Back navigation header */}
                    <button
                      onClick={() => navigate("schools")}
                      className="self-start inline-flex items-center gap-1 text-xs font-bold text-brand-crimson hover:text-brand-charcoal bg-brand-paper border border-brand-border px-3 py-1.5 rounded-lg shadow-2xs focus:outline-none transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>{t.backToDirectory}</span>
                    </button>

                    {/* School Cover Presentation Block */}
                    <div className="bg-brand-paper border-4 border-brand-charcoal rounded-xl overflow-hidden shadow-md">
                      <div className="bg-gradient-to-r from-brand-crimson to-brand-terracotta text-brand-cream p-6 sm:p-10 flex flex-col sm:flex-row gap-6 sm:gap-8 items-center border-b-4 border-brand-charcoal">
                        <div className="w-24 h-24 sm:w-28 sm:h-28 bg-brand-paper border-4 border-brand-charcoal rounded-2xl overflow-hidden shadow-md flex items-center justify-center shrink-0">
                          <img
                            src={school.logo_url}
                            alt={school.school_name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex flex-col gap-2.5 text-center sm:text-left">
                          <span className="self-center sm:self-start bg-brand-paper/20 text-brand-paper border border-brand-paper/20 text-xs font-bold font-sans px-3 py-1 rounded-md">
                            {location} {currentLanguage === "hi" ? "जिला" : "District"}
                          </span>
                          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-serif leading-tight">
                            {name}
                          </h1>
                          <p className="text-sm font-sans text-brand-cream/95 flex items-center justify-center sm:justify-start gap-1">
                            <MapPin className="w-4 h-4 text-brand-gold" />
                            <span>{school.address}</span>
                          </p>
                        </div>
                      </div>

                      <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10 font-sans">
                        {/* School details sidebar details */}
                        <div className="flex flex-col gap-6">
                          <div className="bg-brand-cream border border-brand-border rounded-xl p-5 shadow-2xs flex flex-col gap-4">
                            <h3 className="font-bold text-sm text-brand-crimson font-serif uppercase tracking-wider border-b border-brand-border pb-2 flex items-center gap-1.5">
                              <Building2 className="w-4 h-4" />
                              <span>{t.schoolDetails}</span>
                            </h3>
                            <div className="flex flex-col gap-3 text-xs text-brand-charcoal/90">
                              <div className="flex items-start gap-2.5">
                                <User className="w-4 h-4 text-brand-charcoal/40 shrink-0 mt-0.5" />
                                <div>
                                  <div className="text-[10px] font-bold text-brand-charcoal/50 uppercase">{t.contactPerson}</div>
                                  <div className="font-bold text-brand-charcoal text-sm mt-0.5">{school.contact_person}</div>
                                </div>
                              </div>
                              <div className="flex items-start gap-2.5 border-t border-brand-border/40 pt-2.5">
                                <Phone className="w-4 h-4 text-brand-charcoal/40 shrink-0 mt-0.5" />
                                <div>
                                  <div className="text-[10px] font-bold text-brand-charcoal/50 uppercase">{t.phoneLabelField}</div>
                                  <a href={`tel:${school.phone}`} className="font-mono font-bold text-sm text-brand-charcoal mt-0.5 block hover:text-brand-crimson transition-colors">{school.phone}</a>
                                </div>
                              </div>
                              <div className="flex items-start gap-2.5 border-t border-brand-border/40 pt-2.5">
                                <Globe className="w-4 h-4 text-brand-charcoal/40 shrink-0 mt-0.5" />
                                <div>
                                  <div className="text-[10px] font-bold text-brand-charcoal/50 uppercase">{t.websiteStatusLabel}</div>
                                  <div className="mt-1 font-bold text-sm">
                                    {school.website_status.toLowerCase() === "completed" ? (
                                      <span className="text-brand-forest bg-brand-forest/10 px-2 py-0.5 rounded text-xs inline-block border border-brand-forest/20">
                                        {t.completed}
                                      </span>
                                    ) : school.website_status.toLowerCase() === "in progress" ? (
                                      <span className="text-brand-gold bg-brand-gold/10 px-2 py-0.5 rounded text-xs inline-block border border-brand-gold/20">
                                        {t.inProgress}
                                      </span>
                                    ) : (
                                      <span className="text-brand-crimson bg-brand-crimson/10 px-2 py-0.5 rounded text-xs inline-block border border-brand-crimson/20">
                                        {t.notStarted}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* CTA Banner Website builder */}
                          <div className="bg-brand-charcoal text-brand-cream border-t-4 border-brand-gold rounded-xl p-5 shadow-2xs flex flex-col gap-3">
                            <Sparkles className="w-5 h-5 text-brand-gold animate-pulse" />
                            <h4 className="font-bold text-sm text-brand-paper font-serif leading-snug">
                              {t.getCustomWebsiteHeader}
                            </h4>
                            <p className="text-xs text-brand-cream/80 leading-relaxed">
                              {linkifyZera(t.getCustomWebsiteDesc)}
                            </p>
                            <a
                              href="https://zeratech.io"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full mt-1.5 py-2.5 bg-brand-gold hover:bg-brand-paper text-brand-charcoal font-bold text-xs rounded-lg transition-colors focus:outline-none text-center block"
                            >
                              {t.getWebsite}
                            </a>
                          </div>
                        </div>

                        {/* Profile photo gallery and related news articles */}
                        <div className="lg:col-span-2 flex flex-col gap-8">
                          {/* Photo Gallery linked to this school */}
                          {schoolMedia.length > 0 && (
                            <div className="flex flex-col gap-4">
                              <h3 className="text-lg font-bold font-serif text-brand-charcoal border-b border-brand-border pb-1.5 flex items-center gap-1.5">
                                <Sparkles className="w-4 h-4 text-brand-gold" />
                                <span>{t.schoolGallery}</span>
                              </h3>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {schoolMedia.map((img) => (
                                  <div key={img.id} className="bg-brand-cream border border-brand-border rounded-lg p-2 flex flex-col gap-2 shadow-2xs">
                                    <div className="aspect-video overflow-hidden rounded-md border border-brand-border bg-brand-paper">
                                      <img
                                        src={img.image_url}
                                        alt={currentLanguage === "hi" ? img.caption_hi : img.caption_en}
                                        referrerPolicy="no-referrer"
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <p className="text-xs text-brand-charcoal/70 text-center italic font-semibold leading-relaxed">
                                      {currentLanguage === "hi" ? img.caption_hi : img.caption_en}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Related stories list */}
                          <div className="flex flex-col gap-4">
                            <h3 className="text-lg font-bold font-serif text-brand-charcoal border-b border-brand-border pb-1.5 flex items-center gap-1.5">
                              <BookOpen className="w-4 h-4 text-brand-crimson" />
                              <span>{t.relatedStories}</span>
                            </h3>

                            {relatedStories.length === 0 ? (
                              <p className="text-xs text-brand-charcoal/50 italic bg-brand-cream border border-brand-border rounded-lg p-5">
                                {currentLanguage === "hi"
                                  ? "वर्तमान में इस विद्यालय से संबंधित कोई प्रकाशित समाचार उपलब्ध नहीं है।"
                                  : "Currently no published news stories are available for this school."}
                              </p>
                            ) : (
                              <div className="flex flex-col gap-4">
                                {relatedStories.map((story) => (
                                  <div
                                    key={story.id}
                                    className="bg-brand-cream hover:bg-brand-paper border border-brand-border hover:border-brand-crimson/30 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-center transition-all group shadow-2xs hover:shadow-xs"
                                  >
                                    <div className="w-full sm:w-24 aspect-video sm:aspect-square overflow-hidden rounded-lg bg-brand-paper border border-brand-border shrink-0">
                                      <img
                                        src={story.cover_image_url}
                                        alt={story.title_en}
                                        referrerPolicy="no-referrer"
                                        className="w-full h-full object-cover group-hover:scale-102 transition-transform"
                                      />
                                    </div>
                                    <div className="flex flex-col gap-1.5 w-full">
                                      <div className="flex items-center gap-2 text-[10px] font-bold text-brand-charcoal/50 font-sans">
                                        <Calendar className="w-3.5 h-3.5 text-brand-crimson" />
                                        <span>{story.date}</span>
                                        <span>&bull;</span>
                                        <span>{story.category}</span>
                                      </div>
                                      <h4 className="font-serif font-bold text-sm sm:text-base text-brand-charcoal leading-snug group-hover:text-brand-crimson transition-colors line-clamp-2">
                                        {currentLanguage === "hi" ? story.title_hi : story.title_en}
                                      </h4>
                                      <p className="text-xs text-brand-charcoal/70 line-clamp-2 mt-0.5 leading-relaxed font-sans">
                                        {currentLanguage === "hi" ? story.summary_hi : story.summary_en}
                                      </p>
                                      <button
                                        onClick={() => navigate("story", story.slug)}
                                        className="self-start text-[11px] font-bold text-brand-crimson flex items-center gap-0.5 mt-1 focus:outline-none group-hover:underline cursor-pointer"
                                      >
                                        <span>{t.viewStory}</span>
                                        <span>&raquo;</span>
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* PAGE 5: ABOUT / CONTACT */}
              {route.page === "about" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-start mt-4">
                  {/* Left Column: Organization coordinates and profile info */}
                  <div className="flex flex-col gap-6 font-sans leading-relaxed text-brand-charcoal/90">
                    <div className="bg-brand-paper border-2 border-brand-border rounded-xl p-6 sm:p-8 shadow-xs flex flex-col gap-5">
                      <h2 className="text-2xl sm:text-3xl font-extrabold font-serif text-brand-charcoal border-b border-brand-border pb-3 flex items-center gap-2">
                        <span className="w-1.5 h-7 bg-brand-crimson inline-block"></span>
                        <span>{t.aboutTitle}</span>
                      </h2>
                      <p className="text-sm leading-relaxed text-brand-charcoal/80">
                        {t.aboutText1}
                      </p>
                      <p className="text-sm leading-relaxed text-brand-charcoal/80">
                        {linkifyZera(t.aboutText2, true)}
                      </p>

                      {/* Coordinates box */}
                      <div className="bg-brand-cream border border-brand-border rounded-xl p-5 mt-4 flex flex-col gap-4">
                        <h4 className="font-bold text-sm text-brand-crimson font-serif uppercase tracking-wider flex items-center gap-1">
                          <Building2 className="w-4 h-4 text-brand-gold" />
                          <span>पंजीकृत कार्यालय विवरण / Coordinates</span>
                        </h4>
                        <div className="flex flex-col gap-3.5 text-xs">
                          <div className="flex items-start gap-2.5">
                            <MapPin className="w-4 h-4 text-brand-crimson shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold block text-brand-charcoal/50 uppercase">{t.addressLabel}</span>
                              <span className="font-semibold text-brand-charcoal mt-1 block leading-relaxed">{t.addressValue}</span>
                            </div>
                          </div>
                          <div className="flex items-start gap-2.5 border-t border-brand-border/40 pt-3">
                            <Phone className="w-4 h-4 text-brand-crimson shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold block text-brand-charcoal/50 uppercase">{t.phoneLabelField}</span>
                              <a href="tel:9835102324" className="font-mono font-bold text-brand-charcoal text-sm mt-1 block hover:text-brand-crimson transition-colors">
                                +91 9835102324
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Mission note */}
                    <div className="bg-[#fdfaf2] border border-brand-gold/40 rounded-xl p-6 shadow-2xs flex gap-4 items-start">
                      <Award className="w-8 h-8 text-brand-gold shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold font-serif text-brand-charcoal text-sm uppercase">बिहार के शैक्षणिक नवोन्मेष को समर्पित</h4>
                        <p className="text-xs text-brand-charcoal/70 leading-relaxed mt-1.5">
                          ज़ीरा टेक्नोलॉजीज ने हमेशा शैक्षणिक संगठनों को उनके डिजिटल उत्थान में पूर्ण सहयोग देने का प्रण लिया है। यदि आप भी कोसी में आधुनिक वेब समाधानों का लाभ उठाना चाहते हैं, तो दाईं ओर दिए गए संपर्क फॉर्म को भरें।
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Contact form with prefill capability */}
                  <div className="flex flex-col gap-4">
                    {/* Display info bubble if organization is prefilled from profile */}
                    {route.prefill && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-brand-gold/10 border border-brand-gold/20 text-brand-terracotta p-4 rounded-xl flex items-center gap-3 text-xs sm:text-sm font-sans"
                      >
                        <Sparkles className="w-5 h-5 text-brand-gold shrink-0 animate-pulse" />
                        <div>
                          <span className="font-bold block">
                            {currentLanguage === "hi" ? "सक्रिय विद्यालय संदर्भ:" : "School Reference Active:"}
                          </span>
                          <span className="font-semibold text-brand-charcoal">
                            {route.prefill} ({currentLanguage === "hi" ? "के लिए वेबसाइट पूछताछ" : "Website Inquiry"})
                          </span>
                        </div>
                      </motion.div>
                    )}

                    {/* Pre-fill container wrapper */}
                    <ContactFormPrefilledWrapper
                      currentLanguage={currentLanguage}
                      prefillOrgName={route.prefill}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>



      {/* Site Footer */}
      <Footer currentLanguage={currentLanguage} navigate={navigate} />
    </div>
  );
}

// Wrapper component to pass prefill values to ContactForm
function ContactFormPrefilledWrapper({
  currentLanguage,
  prefillOrgName,
}: {
  currentLanguage: "hi" | "en";
  prefillOrgName?: string;
}) {
  // Simple state loader to re-render component with new default value if prefill changes
  return (
    <div key={prefillOrgName || "empty"}>
      <PrefilledContactFormWrapper
        currentLanguage={currentLanguage}
        prefillOrgName={prefillOrgName}
      />
    </div>
  );
}

function PrefilledContactFormWrapper({
  currentLanguage,
  prefillOrgName,
}: {
  currentLanguage: "hi" | "en";
  prefillOrgName?: string;
}) {
  const t = translations[currentLanguage];
  const isAdmin = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("admin") === "true";

  const [name, setName] = useState("");
  const [org, setOrg] = useState(prefillOrgName || "");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState(
    prefillOrgName
      ? currentLanguage === "hi"
        ? `नमस्ते, मैं ${prefillOrgName} के लिए अपनी नई वेबसाइट बनवाने के विषय में विवरण जानना चाहता हूँ। कृपया संपर्क करें।`
        : `Hello, I would like to query about getting a beautiful new website designed for ${prefillOrgName}. Please get in touch.`
      : ""
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Admin Config State
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [customSubmitUrl, setCustomSubmitUrl] = useState(() => {
    const saved = localStorage.getItem("csv_contact_submit_url");
    if (saved && saved.trim().startsWith("https://")) {
      return saved.trim();
    }
    return urlConfig.contactSubmitUrl || "";
  });
  const [isUrlSaved, setIsUrlSaved] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Local backups list state
  const [localSubmissions, setLocalSubmissions] = useState<any[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("local_contact_submissions") || "[]");
    } catch (e) {
      return [];
    }
  });

  const handleSaveUrl = () => {
    localStorage.setItem("csv_contact_submit_url", customSubmitUrl);
    setIsUrlSaved(true);
    setTimeout(() => setIsUrlSaved(false), 3000);
  };

  const handleClearBackups = () => {
    if (window.confirm(currentLanguage === "hi" ? "क्या आप सभी स्थानीय बैकअप हटाना चाहते हैं?" : "Are you sure you want to clear all local backup logs?")) {
      localStorage.removeItem("local_contact_submissions");
      setLocalSubmissions([]);
    }
  };

  const handleDeleteBackupItem = (idx: number) => {
    const updated = localSubmissions.filter((_, i) => i !== idx);
    localStorage.setItem("local_contact_submissions", JSON.stringify(updated));
    setLocalSubmissions(updated);
  };

  const handleCopyScript = () => {
    const scriptText = `function doPost(e) {
  try {
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    // Look for the specified sheet ID (533153718) or by name "Contact Responses"
    var sheet = doc.getSheets().find(function(s) { 
      return s.getSheetId() === 533153718; 
    }) || doc.getSheetByName("Contact Responses") || doc.getSheets()[0];
    
    var data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch(err) {
      data = e.parameter;
    }
    
    var timestamp = new Date();
    var name = data.name || "";
    var org = data.org || "";
    var phone = data.phone || "";
    var message = data.message || "";
    
    sheet.appendRow([timestamp, name, org, phone, message]);
    
    return ContentService.createTextOutput(JSON.stringify({ "status": "success" }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader("Access-Control-Allow-Origin", "*");
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader("Access-Control-Allow-Origin", "*");
  }
}

function doGet(e) {
  return ContentService.createTextOutput("Active")
    .setHeader("Access-Control-Allow-Origin", "*");
}`;

    navigator.clipboard.writeText(scriptText);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !message) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const activeSubmitUrl = customSubmitUrl.trim();

    const payload = {
      timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      name,
      org,
      phone,
      message,
    };

    // Store in backup list
    try {
      const existing = JSON.parse(localStorage.getItem("local_contact_submissions") || "[]");
      existing.unshift(payload);
      localStorage.setItem("local_contact_submissions", JSON.stringify(existing));
      setLocalSubmissions(existing);
    } catch (e) {
      console.error("Backup save failed:", e);
    }

    if (activeSubmitUrl) {
      try {
        // Use a single no-cors fetch request. Google Apps Script redirects will cause standard CORS mode 
        // to throw a network error (triggering a false-negative catch block), but no-cors handles the redirect seamlessly.
        await fetch(activeSubmitUrl, {
          method: "POST",
          mode: "no-cors",
          headers: {
            "Content-Type": "text/plain;charset=utf-8",
          },
          body: JSON.stringify(payload),
        });
        
        setIsSubmitted(true);
      } catch (err: any) {
        console.error("Form submission failed:", err);
        setSubmitError(
          currentLanguage === "hi"
            ? "सबमिट करने में त्रुटि हुई। हालांकि, आपका डेटा इस डिवाइस पर स्थानीय रूप से बैकअप कर लिया गया है!"
            : "Failed to submit to Google Sheet. However, your message is saved securely on this device's backup!"
        );
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Direct success on empty URL with Local Save notice
      setIsSubmitting(false);
      setIsSubmitted(true);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Contact Form Card */}
      <div className="bg-brand-paper border-2 border-brand-border rounded-xl p-6 sm:p-8 shadow-xs">
        <h3 className="text-xl sm:text-2xl font-bold font-serif text-brand-charcoal border-b border-brand-border pb-3 mb-6 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-brand-crimson inline-block"></span>
          <span>{t.contactUs}</span>
        </h3>

        {isSubmitted ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-brand-forest/10 border border-brand-forest/20 text-brand-forest p-6 rounded-lg flex flex-col items-center text-center gap-3"
          >
            <Check className="w-12 h-12 text-brand-forest bg-brand-forest/10 p-2.5 rounded-full" />
            <p className="font-sans font-bold text-base leading-relaxed">
              {t.contactSuccess}
            </p>
            {customSubmitUrl ? (
              <p className="text-xs text-brand-forest/80 font-sans mt-0.5">
                {currentLanguage === "hi" 
                  ? "✓ गूगल शीट में सीधे दर्ज कर लिया गया है!" 
                  : "✓ Recorded directly in your linked Google Sheet!"}
              </p>
            ) : (
              <div className="bg-brand-gold/15 text-brand-terracotta border border-brand-gold/25 p-3 rounded-lg text-xs mt-2 max-w-sm">
                <strong>{currentLanguage === "hi" ? "स्थानीय बैकअप सहेजा गया:" : "Saved to Local Backup:"}</strong>{" "}
                {currentLanguage === "hi" 
                  ? "चूंकि कोई गूगल शीट सबमिट URL कॉन्फ़िगर नहीं है, इसलिए आपका डेटा नीचे दिए गए एडमन पैनल बैकअप सेक्शन में सुरक्षित है।" 
                  : "Since no Google Sheet submit URL is configured, your entry has been securely backed up below."}
              </div>
            )}
            <button
              onClick={() => {
                setIsSubmitted(false);
                setName("");
                setPhone("");
                setMessage("");
              }}
              className="mt-2 text-xs font-bold text-brand-crimson underline focus:outline-none hover:text-brand-charcoal cursor-pointer"
            >
              {currentLanguage === "hi" ? "नया संदेश भेजें" : "Send another message"}
            </button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-sm font-sans">
            {submitError && (
              <div className="bg-brand-crimson/10 border border-brand-crimson/20 text-brand-crimson p-4 rounded-lg text-xs font-semibold">
                {submitError}
              </div>
            )}

            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-brand-charcoal/90">
                {t.nameLabel} <span className="text-brand-crimson">*</span>
              </label>
              <input
                type="text"
                required
                disabled={isSubmitting}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={currentLanguage === "hi" ? "अपना नाम लिखें" : "Enter your name"}
                className="w-full px-3 py-2.5 bg-brand-cream border border-brand-border rounded-md focus:outline-none focus:border-brand-crimson focus:bg-brand-paper"
              />
            </div>

            {/* School/Organization */}
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-brand-charcoal/90">
                {t.orgLabel}
              </label>
              <input
                type="text"
                disabled={isSubmitting}
                value={org}
                onChange={(e) => setOrg(e.target.value)}
                placeholder={currentLanguage === "hi" ? "स्कूल या संस्था का नाम" : "Enter school name"}
                className="w-full px-3 py-2.5 bg-brand-cream border border-brand-border rounded-md focus:outline-none focus:border-brand-crimson focus:bg-brand-paper"
              />
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-brand-charcoal/90">
                {t.phoneLabel} <span className="text-brand-crimson">*</span>
              </label>
              <input
                type="tel"
                required
                disabled={isSubmitting}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9835102324"
                className="w-full px-3 py-2.5 bg-brand-cream border border-brand-border rounded-md focus:outline-none focus:border-brand-crimson focus:bg-brand-paper font-mono"
              />
            </div>

            {/* Message */}
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-brand-charcoal/90">
                {t.messageLabel} <span className="text-brand-crimson">*</span>
              </label>
              <textarea
                required
                rows={4}
                disabled={isSubmitting}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={currentLanguage === "hi" ? "अपना संदेश यहाँ लिखें..." : "Write your message here..."}
                className="w-full px-3 py-2.5 bg-brand-cream border border-brand-border rounded-md focus:outline-none focus:border-brand-crimson focus:bg-brand-paper"
              ></textarea>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full py-3 bg-brand-crimson hover:bg-brand-crimson/95 disabled:bg-brand-crimson/50 text-brand-cream font-bold rounded-md shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 focus:outline-none cursor-pointer"
            >
              <Send className="w-4 h-4 shrink-0" />
              <span className="font-bold font-sans">
                {isSubmitting 
                  ? (currentLanguage === "hi" ? "भेजा जा रहा है..." : "Submitting...") 
                  : t.submitBtn}
              </span>
            </button>
          </form>
        )}
      </div>

      {/* ADMIN CONTROL PANEL - GOOGLE SHEET INTEGRATION */}
      {isAdmin && (
        <div className="bg-brand-paper border border-brand-border rounded-xl shadow-2xs overflow-hidden font-sans">
          <button
            onClick={() => setShowAdminPanel(!showAdminPanel)}
            className="w-full px-5 py-4 flex items-center justify-between bg-brand-cream/40 border-b border-brand-border hover:bg-brand-cream/80 transition-colors focus:outline-none text-left"
          >
            <div className="flex items-center gap-2.5">
              <Settings className="w-4 h-4 text-brand-crimson animate-spin-slow" />
              <div>
                <h4 className="font-bold text-sm text-brand-charcoal flex items-center gap-2">
                  <span>गूगल शीट एडमिन सेटिंग्स</span>
                  <span className="text-xs font-normal text-brand-charcoal/50">| Google Sheet Admin Settings</span>
                </h4>
              </div>
            </div>
            {showAdminPanel ? (
              <ChevronUp className="w-4 h-4 text-brand-charcoal/60" />
            ) : (
              <ChevronDown className="w-4 h-4 text-brand-charcoal/60" />
            )}
          </button>

          {showAdminPanel && (
            <div className="p-5 flex flex-col gap-6">
              {/* Submit URL configuration */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-brand-charcoal/80 block uppercase tracking-wide">
                  Google Apps Script Web App Submit URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://script.google.com/macros/s/.../exec"
                    value={customSubmitUrl}
                    onChange={(e) => setCustomSubmitUrl(e.target.value)}
                    className="flex-1 text-xs px-3 py-2.5 bg-brand-cream border border-brand-border rounded-md font-mono focus:outline-none focus:border-brand-crimson"
                  />
                  <button
                    onClick={handleSaveUrl}
                    className="px-4 py-2 bg-brand-charcoal hover:bg-brand-crimson text-brand-cream text-xs font-bold rounded-md transition-colors cursor-pointer shrink-0"
                  >
                    {isUrlSaved ? (currentLanguage === "hi" ? "सुरक्षित!" : "Saved!") : (currentLanguage === "hi" ? "सहेजें" : "Save")}
                  </button>
                </div>
                <p className="text-[11px] text-brand-charcoal/60 leading-relaxed mt-1">
                  {currentLanguage === "hi"
                    ? "गूगल शीट से सबमिशन को जोड़ने के लिए नीचे दिए गए 3 चरणों का पालन करें और जेनरेट हुआ वेब एप URL यहाँ सहेजें।"
                    : "Paste your published Google Apps Script URL here to route contact form inquiries directly to your spreadsheet."}
                </p>
              </div>

              {/* How to link instructions */}
              <div className="border-t border-brand-border/60 pt-4 flex flex-col gap-3">
                <h5 className="font-bold text-xs text-brand-crimson uppercase tracking-wide flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" />
                  <span>गूगल शीट जोड़ने के चरण / How to link your Google Sheet</span>
                </h5>
                
                <ol className="text-xs text-brand-charcoal/80 list-decimal list-inside flex flex-col gap-2.5 leading-relaxed pl-1">
                  <li>
                    <span className="font-semibold">{currentLanguage === "hi" ? "गूगल शीट स्क्रिप्ट खोलें:" : "Open Apps Script:"}</span>{" "}
                    {currentLanguage === "hi"
                      ? "अपनी गूगल शीट पर जाएं, मेनू में"
                      : "Go to your Google Sheet, select"}{" "}
                    <strong className="font-bold font-serif">Extensions &gt; Apps Script</strong>.
                  </li>
                  <li>
                    <span className="font-semibold">{currentLanguage === "hi" ? "कोड बदलें:" : "Paste Code:"}</span>{" "}
                    {currentLanguage === "hi"
                      ? "वहाँ जो भी डिफ़ॉल्ट कोड है उसे डिलीट करें और नीचे दिया गया कोड पेस्ट करें:"
                      : "Delete any placeholder code and paste the custom script block below:"}
                    <div className="relative mt-2 border border-brand-border rounded-md overflow-hidden bg-brand-cream max-h-40 overflow-y-auto">
                      <pre className="p-3 text-[10px] font-mono leading-relaxed text-brand-charcoal/90 select-all">
                        {`function doPost(e) {
  try {
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = doc.getSheets().find(function(s) { 
      return s.getSheetId() === 533153718; 
    }) || doc.getSheetByName("Contact Responses") || doc.getSheets()[0];
    
    var data = JSON.parse(e.postData.contents);
    var timestamp = new Date();
    var name = data.name || "";
    var org = data.org || "";
    var phone = data.phone || "";
    var message = data.message || "";
    
    sheet.appendRow([timestamp, name, org, phone, message]);
    
    return ContentService.createTextOutput(JSON.stringify({ "status": "success" }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader("Access-Control-Allow-Origin", "*");
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ "status": "error" }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader("Access-Control-Allow-Origin", "*");
  }
}`}
                      </pre>
                      <button
                        onClick={handleCopyScript}
                        className="absolute top-2 right-2 px-2 py-1 bg-brand-charcoal/80 hover:bg-brand-crimson text-brand-cream text-[10px] font-bold rounded flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {copiedCode ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedCode ? "Copied!" : "Copy Code"}</span>
                      </button>
                    </div>
                  </li>
                  <li>
                    <span className="font-semibold">{currentLanguage === "hi" ? "वेब एप परिनियोजित करें:" : "Deploy as Web App:"}</span>{" "}
                    {currentLanguage === "hi"
                      ? "ऊपर दाईं ओर Deploy बटन पर क्लिक करें > New Deployment चुनें। गियर आइकन पर क्लिक कर 'Web app' चुनें।"
                      : "Click Deploy > New Deployment. Select 'Web app' type. Configure:"}
                    <ul className="list-disc list-inside pl-4 mt-1 text-[11px] text-brand-charcoal/70 flex flex-col gap-0.5">
                      <li><strong>Execute as:</strong> Me</li>
                      <li><strong>Who has access:</strong> Anyone</li>
                    </ul>
                    {currentLanguage === "hi"
                      ? "परिनियोजित (Deploy) कर जेनरेट हुए Web App URL को कॉपी कर ऊपर बने बॉक्स में पेस्ट करके सेव करें।"
                      : "Click Deploy, authorize permissions, copy the Web App URL, and paste it into the config input above."}
                  </li>
                </ol>
              </div>

              {/* Backups list log */}
              <div className="border-t border-brand-border/60 pt-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-xs text-brand-crimson uppercase tracking-wide flex items-center gap-1">
                    <Database className="w-3.5 h-3.5" />
                    <span>स्थानीय बैकअप लॉग / Local Submissions Backup ({localSubmissions.length})</span>
                  </h5>
                  {localSubmissions.length > 0 && (
                    <button
                      onClick={handleClearBackups}
                      className="text-[10px] font-bold text-brand-crimson/80 hover:text-brand-crimson flex items-center gap-0.5 cursor-pointer hover:underline"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>{currentLanguage === "hi" ? "सब साफ़ करें" : "Clear All"}</span>
                    </button>
                  )}
                </div>

                {localSubmissions.length === 0 ? (
                  <p className="text-[11px] italic text-brand-charcoal/50 bg-brand-cream/50 p-3 rounded-lg text-center">
                    {currentLanguage === "hi"
                      ? "इस डिवाइस पर कोई स्थानीय सबमिशन सहेजा नहीं गया है।"
                      : "No form submissions have been locally recorded on this device yet."}
                  </p>
                ) : (
                  <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
                    {localSubmissions.map((sub, idx) => (
                      <div key={idx} className="bg-brand-cream border border-brand-border/60 rounded-lg p-3 text-xs flex justify-between items-start gap-4 hover:border-brand-gold/40 transition-colors">
                        <div className="flex-1 flex flex-col gap-1.5 font-sans">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-brand-charcoal text-[13px]">{sub.name}</span>
                            {sub.org && (
                              <span className="bg-brand-charcoal/5 text-brand-charcoal/70 px-1.5 py-0.5 rounded text-[10px] font-medium font-serif">
                                {sub.org}
                              </span>
                            )}
                            <span className="text-[10px] text-brand-charcoal/40 font-mono ml-auto">{sub.timestamp}</span>
                          </div>
                          <div className="text-[11px] text-brand-charcoal/70">
                            <strong>{currentLanguage === "hi" ? "फ़ोन:" : "Phone:"}</strong> <span className="font-mono font-semibold">{sub.phone}</span>
                          </div>
                          <div className="text-brand-charcoal bg-brand-paper p-2 rounded border border-brand-border/30 text-[11px] leading-relaxed italic whitespace-pre-wrap mt-1">
                            {sub.message}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteBackupItem(idx)}
                          className="text-brand-charcoal/40 hover:text-brand-crimson p-1 rounded hover:bg-brand-crimson/5 transition-colors focus:outline-none cursor-pointer"
                          title="Delete this record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
