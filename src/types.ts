/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Story {
  id: string;
  title_en: string;
  title_hi: string;
  slug: string;
  school_name: string;
  date: string;
  category: string;
  summary_en: string;
  summary_hi: string;
  body_en: string;
  body_hi: string;
  cover_image_url: string;
  status: string; // published, draft
}

export interface School {
  id: string;
  school_name: string;
  school_name_hi: string;
  slug: string;
  location: string; // Madhepura, Saharsa, Purnia, Supaul
  location_hi: string;
  contact_person: string;
  phone: string;
  address: string;
  logo_url: string;
  featured: boolean;
  website_status: string; // Completed, In Progress, Not Started
  story_ids: string[]; // array of strings
  website_url?: string;
}

export interface Media {
  id: string;
  image_url: string;
  caption_en: string;
  caption_hi: string;
  linked_story_id: string;
}

export type Language = "hi" | "en";
