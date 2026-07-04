/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from "react";
import { translations } from "../translations";
import { Send, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

interface ContactFormProps {
  currentLanguage: "hi" | "en";
}

export default function ContactForm({ currentLanguage }: ContactFormProps) {
  const t = translations[currentLanguage];

  const [name, setName] = useState("");
  const [org, setOrg] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !message) return;

    // Simulate submission to server/Zera Technologies
    setIsSubmitted(true);

    // Reset fields after some time (optional, but keep state for success view)
    setName("");
    setOrg("");
    setPhone("");
    setMessage("");
  };

  return (
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
          <CheckCircle2 className="w-12 h-12 text-brand-forest" />
          <p className="font-sans font-bold text-base leading-relaxed">
            {t.contactSuccess}
          </p>
          <button
            onClick={() => setIsSubmitted(false)}
            className="mt-2 text-xs font-bold text-brand-crimson underline focus:outline-none hover:text-brand-charcoal"
          >
            {currentLanguage === "hi" ? "नया संदेश भेजें" : "Send another message"}
          </button>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-sm font-sans">
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-brand-charcoal/90">
              {t.nameLabel} <span className="text-brand-crimson">*</span>
            </label>
            <input
              type="text"
              required
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
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={currentLanguage === "hi" ? "अपना संदेश यहाँ लिखें..." : "Write your message here..."}
              className="w-full px-3 py-2.5 bg-brand-cream border border-brand-border rounded-md focus:outline-none focus:border-brand-crimson focus:bg-brand-paper"
            ></textarea>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="mt-2 w-full py-3 bg-brand-crimson hover:bg-brand-crimson/95 text-brand-cream font-bold rounded-md shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 focus:outline-none"
          >
            <Send className="w-4 h-4" />
            <span>{t.submitBtn}</span>
          </button>
        </form>
      )}
    </div>
  );
}
