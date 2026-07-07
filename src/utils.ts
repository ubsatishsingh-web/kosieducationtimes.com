/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Story, School, Media } from "./types";

/**
 * Standard RFC-4180 compliant CSV parser that supports quoted strings,
 * double quotes escaping, and multiline cells.
 */
export function parseCSV(text: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [];
  let currentValue = "";
  let inQuotes = false;
  let isFieldStart = true;
  let hasQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (isFieldStart) {
      if (char === ' ' || char === '\t') {
        currentValue += char;
        continue;
      }
      if (char === '"') {
        inQuotes = true;
        hasQuotes = true;
        isFieldStart = false;
        currentValue = "";
        continue;
      }
      isFieldStart = false;
    }

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          currentValue += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        currentValue += char;
      }
    } else {
      if (char === ',') {
        row.push(currentValue.trim());
        currentValue = "";
        isFieldStart = true;
        hasQuotes = false;
      } else if (char === '\r' || char === '\n') {
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
        row.push(currentValue.trim());
        if (row.length > 1 || (row.length === 1 && row[0] !== "")) {
          lines.push(row);
        }
        row = [];
        currentValue = "";
        isFieldStart = true;
        hasQuotes = false;
      } else {
        currentValue += char;
      }
    }
  }

  if (row.length > 0 || currentValue !== "" || hasQuotes) {
    row.push(currentValue.trim());
    if (row.length > 1 || (row.length === 1 && row[0] !== "")) {
      lines.push(row);
    }
  }

  return lines;
}

/**
 * Maps CSV headers to column index for safety.
 */
function getIndexMap(headers: string[]): Record<string, number> {
  const indexMap: Record<string, number> = {};
  headers.forEach((header, index) => {
    indexMap[header.trim().toLowerCase()] = index;
  });
  return indexMap;
}

/**
 * Parses stories from CSV text.
 */
export function parseStoriesCSV(csvText: string): Story[] {
  const rows = parseCSV(csvText);
  if (rows.length < 2) return [];

  const headers = rows[0].map(h => h.trim());
  const indexMap = getIndexMap(headers);

  const stories: Story[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    // Allow minor mismatches in columns, fallback gracefully
    const getVal = (colName: string) => {
      const idx = indexMap[colName.toLowerCase()];
      return idx !== undefined && idx < row.length ? row[idx] : "";
    };

    const story: Story = {
      id: getVal("id"),
      title_en: getVal("title_en"),
      title_hi: getVal("title_hi"),
      slug: getVal("slug"),
      school_name: getVal("school_name"),
      date: getVal("date"),
      category: getVal("category"),
      summary_en: getVal("summary_en"),
      summary_hi: getVal("summary_hi"),
      body_en: getVal("body_en"),
      body_hi: getVal("body_hi"),
      cover_image_url: getVal("cover_image_url") || "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800",
      status: getVal("status").toLowerCase() || "published",
    };

    // Only render rows where status = "published" and skip empty rows gracefully.
    if (story.id && story.status === "published") {
      stories.push(story);
    }
  }
  return stories;
}

/**
 * Parses schools from CSV text.
 */
export function parseSchoolsCSV(csvText: string): School[] {
  const rows = parseCSV(csvText);
  if (rows.length < 2) return [];

  const headers = rows[0].map(h => h.trim());
  const indexMap = getIndexMap(headers);

  const schools: School[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const getVal = (colName: string) => {
      const lowerCol = colName.toLowerCase();
      let idx = indexMap[lowerCol];
      if (idx === undefined) {
        const matchingKey = Object.keys(indexMap).find(
          key => key.includes(lowerCol) || lowerCol.includes(key) || key.replace(/[\s_-]/g, "") === lowerCol.replace(/[\s_-]/g, "")
        );
        if (matchingKey) {
          idx = indexMap[matchingKey];
        }
      }
      return idx !== undefined && idx < row.length ? row[idx] : "";
    };

    const storyIdsRaw = getVal("story_ids");
    // Handle split by semicolon or comma
    const story_ids = storyIdsRaw
      ? storyIdsRaw.split(/[;,]/).map(s => s.trim()).filter(Boolean)
      : [];

    const school: School = {
      id: getVal("id"),
      school_name: getVal("school_name"),
      school_name_hi: getVal("school_name_hi"),
      slug: getVal("slug"),
      location: getVal("location"),
      location_hi: getVal("location_hi"),
      contact_person: getVal("contact_person") || getVal("contact person"),
      phone: getVal("phone"),
      address: getVal("address"),
      logo_url: getVal("logo_url") || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150",
      featured: getVal("featured").toLowerCase() === "true" || getVal("featured") === "1" || getVal("featured(yes/no)").toLowerCase() === "yes",
      website_status: getVal("website_status") || "Not Started",
      story_ids,
      website_url: getVal("website_url") || undefined,
    };

    if (school.id) {
      schools.push(school);
    }
  }
  return schools;
}

/**
 * Parses media assets from CSV text.
 */
export function parseMediaCSV(csvText: string): Media[] {
  const rows = parseCSV(csvText);
  if (rows.length < 2) return [];

  const headers = rows[0].map(h => h.trim());
  const indexMap = getIndexMap(headers);

  const mediaList: Media[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const getVal = (colName: string) => {
      const idx = indexMap[colName.toLowerCase()];
      return idx !== undefined && idx < row.length ? row[idx] : "";
    };

    const mediaItem: Media = {
      id: getVal("id"),
      image_url: getVal("image_url"),
      caption_en: getVal("caption_en"),
      caption_hi: getVal("caption_hi"),
      linked_story_id: getVal("linked_story_id"),
    };

    if (mediaItem.id && mediaItem.image_url) {
      mediaList.push(mediaItem);
    }
  }
  return mediaList;
}
