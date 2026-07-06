import fs from "fs";
import path from "path";
import express from "express";
import { createServer as createViteServer } from "vite";
import { parseStoriesCSV, parseSchoolsCSV } from "./src/utils";

// Helper to safely parse JSON or read config
function getUrlConfig() {
  try {
    const filePath = path.join(process.cwd(), "src", "urls.json");
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    }
  } catch (error) {
    console.error("Error reading urls.json:", error);
  }
  return {};
}

// Fetch stories data from Google Sheets or fall back to local file
async function getStories() {
  const config = getUrlConfig();
  const storiesUrl = config.storiesUrl || "https://docs.google.com/spreadsheets/d/e/2PACX-1vQpiHkDtoMdOd7ylfqJhaG8HurE2leh3sTFwKVDomUIOCO1A9jmkYkhQ4Sxvr41FdX0jVeac7WMc1nv/pub?gid=0&single=true&output=csv";
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const response = await fetch(storiesUrl, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (response.ok) {
      const text = await response.text();
      return parseStoriesCSV(text);
    }
  } catch (err) {
    console.warn("Failed to fetch stories from Google Sheets, using local fallback...", err);
  }

  // Local fallback
  try {
    const localPath = path.join(process.cwd(), "public", "data", "stories.csv");
    if (fs.existsSync(localPath)) {
      const text = fs.readFileSync(localPath, "utf-8");
      return parseStoriesCSV(text);
    }
  } catch (err) {
    console.error("Failed to read local fallback stories.csv:", err);
  }
  return [];
}

// Fetch schools data from Google Sheets or fall back to local file
async function getSchools() {
  const config = getUrlConfig();
  const schoolsUrl = config.schoolsUrl || "https://docs.google.com/spreadsheets/d/e/2PACX-1vQpiHkDtoMdOd7ylfqJhaG8HurE2leh3sTFwKVDomUIOCO1A9jmkYkhQ4Sxvr41FdX0jVeac7WMc1nv/pub?gid=469496278&single=true&output=csv";
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const response = await fetch(schoolsUrl, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (response.ok) {
      const text = await response.text();
      return parseSchoolsCSV(text);
    }
  } catch (err) {
    console.warn("Failed to fetch schools from Google Sheets, using local fallback...", err);
  }

  // Local fallback
  try {
    const localPath = path.join(process.cwd(), "public", "data", "schools.csv");
    if (fs.existsSync(localPath)) {
      const text = fs.readFileSync(localPath, "utf-8");
      return parseSchoolsCSV(text);
    }
  } catch (err) {
    console.error("Failed to read local fallback schools.csv:", err);
  }
  return [];
}

// Replaces generic meta tags in index.html with page-specific ones
function injectMetaTags(html: string, data: { title: string, description: string, image: string, url: string }) {
  let modified = html;

  const escapeHtml = (str: string) => {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  const escapedTitle = escapeHtml(data.title);
  const escapedDesc = escapeHtml(data.description);
  const escapedImage = data.image;
  const escapedUrl = data.url;

  // Replace Title tag
  modified = modified.replace(/<title>.*?<\/title>/gi, `<title>${escapedTitle}</title>`);
  
  // Replace meta name="title"
  if (/<meta\s+name="title"/i.test(modified)) {
    modified = modified.replace(
      /<meta\s+name="title"\s+content="[^"]*"\s*\/?>/gi,
      `<meta name="title" content="${escapedTitle}" />`
    );
  } else {
    modified = modified.replace("</head>", `  <meta name="title" content="${escapedTitle}" />\n  </head>`);
  }

  // Replace meta name="description"
  if (/<meta\s+name="description"/i.test(modified)) {
    modified = modified.replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/gi,
      `<meta name="description" content="${escapedDesc}" />`
    );
  } else {
    modified = modified.replace("</head>", `  <meta name="description" content="${escapedDesc}" />\n  </head>`);
  }

  // Replace link rel="image_src"
  if (/<link\s+rel="image_src"/i.test(modified)) {
    modified = modified.replace(
      /<link\s+rel="image_src"\s+href="[^"]*"\s*\/?>/gi,
      `<link rel="image_src" href="${escapedImage}" />`
    );
  } else {
    modified = modified.replace("</head>", `  <link rel="image_src" href="${escapedImage}" />\n  </head>`);
  }

  // Replace og:title
  if (/<meta\s+property="og:title"/i.test(modified)) {
    modified = modified.replace(
      /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/gi,
      `<meta property="og:title" content="${escapedTitle}" />`
    );
  } else {
    modified = modified.replace("</head>", `  <meta property="og:title" content="${escapedTitle}" />\n  </head>`);
  }

  // Replace og:description
  if (/<meta\s+property="og:description"/i.test(modified)) {
    modified = modified.replace(
      /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/gi,
      `<meta property="og:description" content="${escapedDesc}" />`
    );
  } else {
    modified = modified.replace("</head>", `  <meta property="og:description" content="${escapedDesc}" />\n  </head>`);
  }

  // Replace og:image
  if (/<meta\s+property="og:image"/i.test(modified)) {
    modified = modified.replace(
      /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/gi,
      `<meta property="og:image" content="${escapedImage}" />`
    );
  } else {
    modified = modified.replace("</head>", `  <meta property="og:image" content="${escapedImage}" />\n  </head>`);
  }

  // Replace og:image:secure_url
  if (/<meta\s+property="og:image:secure_url"/i.test(modified)) {
    modified = modified.replace(
      /<meta\s+property="og:image:secure_url"\s+content="[^"]*"\s*\/?>/gi,
      `<meta property="og:image:secure_url" content="${escapedImage}" />`
    );
  } else {
    modified = modified.replace("</head>", `  <meta property="og:image:secure_url" content="${escapedImage}" />\n  </head>`);
  }

  // Replace og:url
  if (/<meta\s+property="og:url"/i.test(modified)) {
    modified = modified.replace(
      /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/gi,
      `<meta property="og:url" content="${escapedUrl}" />`
    );
  } else {
    modified = modified.replace("</head>", `  <meta property="og:url" content="${escapedUrl}" />\n  </head>`);
  }

  // Replace twitter:title
  if (/<meta\s+property="twitter:title"/i.test(modified)) {
    modified = modified.replace(
      /<meta\s+property="twitter:title"\s+content="[^"]*"\s*\/?>/gi,
      `<meta property="twitter:title" content="${escapedTitle}" />`
    );
  } else {
    modified = modified.replace("</head>", `  <meta property="twitter:title" content="${escapedTitle}" />\n  </head>`);
  }

  // Replace twitter:description
  if (/<meta\s+property="twitter:description"/i.test(modified)) {
    modified = modified.replace(
      /<meta\s+property="twitter:description"\s+content="[^"]*"\s*\/?>/gi,
      `<meta property="twitter:description" content="${escapedDesc}" />`
    );
  } else {
    modified = modified.replace("</head>", `  <meta property="twitter:description" content="${escapedDesc}" />\n  </head>`);
  }

  // Replace twitter:image
  if (/<meta\s+property="twitter:image"/i.test(modified)) {
    modified = modified.replace(
      /<meta\s+property="twitter:image"\s+content="[^"]*"\s*\/?>/gi,
      `<meta property="twitter:image" content="${escapedImage}" />`
    );
  } else {
    modified = modified.replace("</head>", `  <meta property="twitter:image" content="${escapedImage}" />\n  </head>`);
  }

  return modified;
}

async function startServer() {
  const app = express();
  const PORT = 3000;
  let vite: any = null;

  // Set up Vite dev server as middleware in local development
  const isProd = process.env.NODE_ENV === "production";
  if (!isProd) {
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
  }

  // API Route: Sync Google Sheets URLs
  app.post("/api/sync-urls", express.json(), (req, res) => {
    try {
      const { storiesUrl, schoolsUrl, mediaUrl } = req.body;
      const filePath = path.join(process.cwd(), "src", "urls.json");
      
      const config = {
        storiesUrl: storiesUrl || "",
        schoolsUrl: schoolsUrl || "",
        mediaUrl: mediaUrl || "",
        contactSubmitUrl: getUrlConfig().contactSubmitUrl || ""
      };
      
      fs.writeFileSync(filePath, JSON.stringify(config, null, 2), "utf-8");
      res.json({ status: "success" });
    } catch (err: any) {
      console.error("Error in /api/sync-urls:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Intercept Story Detail routes for Open Graph crawling
  app.get("/story/:slug", async (req, res, next) => {
    try {
      const slug = req.params.slug;
      const storiesList = await getStories();
      const story = storiesList.find(s => s.slug === slug);

      if (!story) {
        return next();
      }

      const host = req.get('host') || 'www.kosieducationtimes.com';
      const protocol = req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
      const baseUrl = `${protocol}://${host}`;
      const storyUrl = `${baseUrl}/story/${slug}`;

      // Support lang=en query parameter to serve English meta, otherwise default to Hindi
      const isHi = req.query.lang !== "en";
      const title = isHi && story.title_hi ? `${story.title_hi} - कोसी एजुकेशन टाइम्स` : `${story.title_en} - Kosi Education Times`;
      const desc = isHi && story.summary_hi ? story.summary_hi : story.summary_en;
      
      let image = story.cover_image_url || `${baseUrl}/kosi_edu_banner.jpg`;
      if (image && !image.startsWith("http")) {
        image = `${baseUrl}${image.startsWith("/") ? "" : "/"}${image}`;
      }

      const htmlPath = isProd
        ? path.join(process.cwd(), "dist", "index.html")
        : path.join(process.cwd(), "index.html");

      if (fs.existsSync(htmlPath)) {
        let html = fs.readFileSync(htmlPath, "utf-8");
        if (vite) {
          html = await vite.transformIndexHtml(req.originalUrl, html);
        }
        html = injectMetaTags(html, { title, description: desc, image, url: storyUrl });
        return res.send(html);
      }
    } catch (err) {
      console.error("Error handling /story/:slug in server:", err);
    }
    next();
  });

  // Intercept School Profile routes for Open Graph crawling
  app.get("/school/:slug", async (req, res, next) => {
    try {
      const slug = req.params.slug;
      const schoolsList = await getSchools();
      const school = schoolsList.find(s => s.slug === slug);

      if (!school) {
        return next();
      }

      const host = req.get('host') || 'www.kosieducationtimes.com';
      const protocol = req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
      const baseUrl = `${protocol}://${host}`;
      const schoolUrl = `${baseUrl}/school/${slug}`;

      const isHi = req.query.lang !== "en";
      const title = isHi && school.school_name_hi ? `${school.school_name_hi} - स्कूल प्रोफ़ाइल` : `${school.school_name} - School Profile`;
      const desc = isHi 
        ? `${school.school_name_hi}, ${school.location_hi || school.location} की प्रोफ़ाइल और विवरण। कोसी एजुकेशन टाइम्स पर देखें।`
        : `Profile and details of ${school.school_name}, ${school.location} on Kosi Education Times.`;
      
      let image = school.logo_url || `${baseUrl}/kosi_edu_banner.jpg`;
      if (image && !image.startsWith("http")) {
        image = `${baseUrl}${image.startsWith("/") ? "" : "/"}${image}`;
      }

      const htmlPath = isProd
        ? path.join(process.cwd(), "dist", "index.html")
        : path.join(process.cwd(), "index.html");

      if (fs.existsSync(htmlPath)) {
        let html = fs.readFileSync(htmlPath, "utf-8");
        if (vite) {
          html = await vite.transformIndexHtml(req.originalUrl, html);
        }
        html = injectMetaTags(html, { title, description: desc, image, url: schoolUrl });
        return res.send(html);
      }
    } catch (err) {
      console.error("Error handling /school/:slug in server:", err);
    }
    next();
  });

  // Handle other routes
  if (vite) {
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
