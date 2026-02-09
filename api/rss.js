// Inline slug generation
function generateSlug(title) {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// Manual XML escaping
function escapeXml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

export const config = {
    runtime: 'edge',
};

const RSS_FEEDS = {
    GMA: 'https://data.gmanetwork.com/gno/rss/news/feed.xml',
    INQUIRER: 'https://newsinfo.inquirer.net/feed',
    PHILSTAR: 'https://www.philstar.com/rss/headlines',
    RAPPLER: 'https://www.rappler.com/feed/',
    NEWS5: 'https://www.interaksyon.com/feed/',
    'MANILA TIMES': 'https://www.manilatimes.net/news/feed',
    'DAILY TRIBUNE': 'https://tribune.net.ph/feed/',
    'BUSINESSWORLD': 'https://www.bworldonline.com/feed/'
};

const PUBLISHER_HOME_PAGES = {
    'GMA News': 'https://www.gmanetwork.com/news/',
    'Inquirer': 'https://newsinfo.inquirer.net',
    'PhilStar': 'https://www.philstar.com',
    'Manila Bulletin': 'https://mb.com.ph',
    'Rappler': 'https://www.rappler.com',
    'GMA': 'https://www.gmanetwork.com/news/',
    'Philstar.com': 'https://www.philstar.com',
    'NEWS5': 'https://www.interaksyon.com',
    'MANILA TIMES': 'https://www.manilatimes.net',
    'DAILY TRIBUNE': 'https://tribune.net.ph',
    'BUSINESSWORLD': 'https://www.bworldonline.com'
};

const verifyAndFixLink = (link, sourceName) => {
    if (!link || typeof link !== 'string' || !link.trim().startsWith('http')) {
        return PUBLISHER_HOME_PAGES[sourceName] || 'https://www.google.com';
    }
    return link;
};

const extractImageUrl = (html) => {
    if (!html) return '';
    let imageUrl = '';
    const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
        html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    if (ogMatch && ogMatch[1]) imageUrl = ogMatch[1];
    if (!imageUrl) {
        const fbMatch = html.match(/<meta[^>]+name=["']facebook:image:src["'][^>]+content=["']([^"']+)["']/i) ||
            html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']facebook:image:src["']/i);
        if (fbMatch && fbMatch[1]) imageUrl = fbMatch[1];
    }
    if (!imageUrl) {
        const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i);
        if (imgMatch && imgMatch[1]) imageUrl = imgMatch[1];
    }
    if (imageUrl) {
        if (imageUrl.startsWith('//')) imageUrl = `https:${imageUrl}`;
        if (imageUrl.includes('feedburner') || imageUrl.includes('doubleclick')) return '';
        return imageUrl;
    }
    return '';
};

export default async function handler(request) {
    try {
        const fetchPromises = Object.entries(RSS_FEEDS).map(async ([name, url]) => {
            try {
                const cacheBuster = `&_cb=${Date.now()}`;
                const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}${cacheBuster}`);
                const json = await res.json();
                if (json.status === 'ok') {
                    return json.items.map(i => ({
                        title: i.title,
                        link: verifyAndFixLink(i.link, name),
                        pubDate: i.pubDate,
                        sourceName: name,
                        description: i.content || i.description || '',
                        imageUrl: i.enclosure?.link || i.thumbnail || extractImageUrl(i.content || i.description || '')
                    }));
                }
            } catch (e) {
                console.error(`Fetch failed for ${name}:`, e);
            }
            return [];
        });

        const results = await Promise.all(fetchPromises);
        let validated = results.flat();

        validated = validated.filter(item => {
            const textLength = (item.description || "").replace(/<[^>]*>?/gm, '').length;
            return textLength > 20;
        });

        validated.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

        const topArticles = validated.slice(0, 20);

        // Build RSS XML manually (no external dependencies)
        const items = topArticles.map(item => {
            const cleanText = (item.description || '').replace(/<[^>]*>?/gm, '').trim();
            const slug = generateSlug(item.title);
            const deepLink = `https://daily-taho.vercel.app/?article=${slug}`;
            const pubDate = new Date(item.pubDate).toUTCString();

            return `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(deepLink)}</link>
      <description>${escapeXml(cleanText.substring(0, 500))}</description>
      <pubDate>${pubDate}</pubDate>
      <guid isPermaLink="true">${escapeXml(deepLink)}</guid>
      <source url="${escapeXml(item.link)}">${escapeXml(item.sourceName)}</source>
    </item>`;
        }).join('\n');

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Daily Taho News Feed</title>
    <link>https://daily-taho.vercel.app</link>
    <description>Latest headlines from top Philippine news sources, curated by Daily Taho.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="https://daily-taho.vercel.app/api/rss" rel="self" type="application/rss+xml"/>
    <image>
      <url>https://daily-taho.vercel.app/dt-black.png</url>
      <title>Daily Taho</title>
      <link>https://daily-taho.vercel.app</link>
    </image>
${items}
  </channel>
</rss>`;

        return new Response(
            xml,
            {
                status: 200,
                headers: {
                    'content-type': 'application/rss+xml; charset=utf-8',
                    'cache-control': 'public, s-maxage=300, stale-while-revalidate=60',
                },
            }
        );
    } catch (e) {
        return new Response(
            `<?xml version="1.0" encoding="UTF-8"?><error>${e.message}</error>`,
            { status: 500, headers: { 'content-type': 'application/xml' } }
        );
    }
}
