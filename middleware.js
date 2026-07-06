export const config = {
  matcher: [
    '/story/:slug*',
    '/school/:slug*'
  ],
};

export default async function middleware(request) {
  const url = new URL(request.url);
  
  if (url.pathname.startsWith('/story/')) {
    const slug = url.pathname.split('/story/')[1]?.split('?')[0];
    if (!slug) return;

    const STORIES_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQpiHkDtoMdOd7ylfqJhaG8HurE2leh3sTFwKVDomUIOCO1A9jmkYkhQ4Sxvr41FdX0jVeac7WMc1nv/pub?gid=0&single=true&output=csv';

    try {
      const res = await fetch(STORIES_CSV_URL);
      if (!res.ok) return;
      const csvText = await res.text();
      const rows = csvText.split('\n').map(r => parseCsvRow(r));
      const headers = rows[0];

      const slugIndex = headers.indexOf('slug');
      const titleHiIndex = headers.indexOf('title_hi');
      const titleEnIndex = headers.indexOf('title_en');
      const summaryHiIndex = headers.indexOf('summary_hi');
      const summaryEnIndex = headers.indexOf('summary_en');
      const imageIndex = headers.indexOf('cover_image_url');

      const storyRow = rows.find(r => r[slugIndex] === slug);
      if (!storyRow) return;

      // Default to Hindi title and description if available
      const title = storyRow[titleHiIndex] || storyRow[titleEnIndex] || 'Kosi Education Times';
      const description = storyRow[summaryHiIndex] || storyRow[summaryEnIndex] || '';
      const image = storyRow[imageIndex] || 'https://www.kosieducationtimes.com/kosi_edu_banner.jpg';
      const pageUrl = `https://www.kosieducationtimes.com/story/${slug}`;

      const originResponse = await fetch(request.url);
      let html = await originResponse.text();

      html = html.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(title)}</title>`);
      html = html.replace(/<meta\s+name="title"\s+content="[^"]*"\s*\/?>/gi, `<meta name="title" content="${escapeHtml(title)}" />`);
      html = html.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/gi, `<meta name="description" content="${escapeHtml(description)}" />`);
      html = html.replace(/<link\s+rel="image_src"\s+href="[^"]*"\s*\/?>/gi, `<link rel="image_src" href="${image}" />`);
      
      html = html.replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/gi, `<meta property="og:url" content="${pageUrl}" />`);
      html = html.replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/gi, `<meta property="og:title" content="${escapeHtml(title)}" />`);
      html = html.replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/gi, `<meta property="og:description" content="${escapeHtml(description)}" />`);
      html = html.replace(/<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/gi, `<meta property="og:image" content="${image}" />`);
      html = html.replace(/<meta\s+property="og:image:secure_url"\s+content="[^"]*"\s*\/?>/gi, `<meta property="og:image:secure_url" content="${image}" />`);

      html = html.replace(/<meta\s+property="twitter:title"\s+content="[^"]*"\s*\/?>/gi, `<meta property="twitter:title" content="${escapeHtml(title)}" />`);
      html = html.replace(/<meta\s+property="twitter:description"\s+content="[^"]*"\s*\/?>/gi, `<meta property="twitter:description" content="${escapeHtml(description)}" />`);
      html = html.replace(/<meta\s+property="twitter:image"\s+content="[^"]*"\s*\/?>/gi, `<meta property="twitter:image" content="${image}" />`);

      return new Response(html, {
        headers: { 'content-type': 'text/html; charset=utf-8' },
      });
    } catch (err) {
      return;
    }
  }

  if (url.pathname.startsWith('/school/')) {
    const slug = url.pathname.split('/school/')[1]?.split('?')[0];
    if (!slug) return;

    const SCHOOLS_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQpiHkDtoMdOd7ylfqJhaG8HurE2leh3sTFwKVDomUIOCO1A9jmkYkhQ4Sxvr41FdX0jVeac7WMc1nv/pub?gid=469496278&single=true&output=csv';

    try {
      const res = await fetch(SCHOOLS_CSV_URL);
      if (!res.ok) return;
      const csvText = await res.text();
      const rows = csvText.split('\n').map(r => parseCsvRow(r));
      const headers = rows[0];

      const slugIndex = headers.indexOf('slug');
      const nameHiIndex = headers.indexOf('school_name_hi');
      const nameEnIndex = headers.indexOf('school_name');
      const locationHiIndex = headers.indexOf('location_hi');
      const locationEnIndex = headers.indexOf('location');
      const logoIndex = headers.indexOf('logo_url');

      const schoolRow = rows.find(r => r[slugIndex] === slug);
      if (!schoolRow) return;

      const name = schoolRow[nameHiIndex] || schoolRow[nameEnIndex] || 'School Profile';
      const loc = schoolRow[locationHiIndex] || schoolRow[locationEnIndex] || '';
      const title = `${name} - School Profile | कोसी एजुकेशन टाइम्स`;
      const description = `${name}, ${loc} की विस्तृत प्रोफाइल और विवरण। कोसी एजुकेशन टाइम्स पर देखें।`;
      const image = schoolRow[logoIndex] || 'https://www.kosieducationtimes.com/kosi_edu_banner.jpg';
      const pageUrl = `https://www.kosieducationtimes.com/school/${slug}`;

      const originResponse = await fetch(request.url);
      let html = await originResponse.text();

      html = html.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(title)}</title>`);
      html = html.replace(/<meta\s+name="title"\s+content="[^"]*"\s*\/?>/gi, `<meta name="title" content="${escapeHtml(title)}" />`);
      html = html.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/gi, `<meta name="description" content="${escapeHtml(description)}" />`);
      html = html.replace(/<link\s+rel="image_src"\s+href="[^"]*"\s*\/?>/gi, `<link rel="image_src" href="${image}" />`);
      
      html = html.replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/gi, `<meta property="og:url" content="${pageUrl}" />`);
      html = html.replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/gi, `<meta property="og:title" content="${escapeHtml(title)}" />`);
      html = html.replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/gi, `<meta property="og:description" content="${escapeHtml(description)}" />`);
      html = html.replace(/<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/gi, `<meta property="og:image" content="${image}" />`);
      html = html.replace(/<meta\s+property="og:image:secure_url"\s+content="[^"]*"\s*\/?>/gi, `<meta property="og:image:secure_url" content="${image}" />`);

      html = html.replace(/<meta\s+property="twitter:title"\s+content="[^"]*"\s*\/?>/gi, `<meta property="twitter:title" content="${escapeHtml(title)}" />`);
      html = html.replace(/<meta\s+property="twitter:description"\s+content="[^"]*"\s*\/?>/gi, `<meta property="twitter:description" content="${escapeHtml(description)}" />`);
      html = html.replace(/<meta\s+property="twitter:image"\s+content="[^"]*"\s*\/?>/gi, `<meta property="twitter:image" content="${image}" />`);

      return new Response(html, {
        headers: { 'content-type': 'text/html; charset=utf-8' },
      });
    } catch (err) {
      return;
    }
  }
}

function parseCsvRow(row) {
  var result = [];
  var current = '';
  var inQuotes = false;
  for (var i = 0; i < row.length; i++) {
    var char = row[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
