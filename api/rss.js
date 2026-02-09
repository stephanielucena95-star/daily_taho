
import RSS from 'rss';
import { generateSlug } from '../utils/slug.js';

export const config = {
    runtime: 'nodejs',
};

// Reusing constants and logic from api/feed.js
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

        const topArticles = validated.slice(0, 20); // Top 20 for RSS

        // Generate RSS
        const feed = new RSS({
            title: 'Daily Taho News Feed',
            description: 'Latest headlines from top Philippine news sources, curated by Daily Taho.',
            feed_url: 'https://daily-taho.vercel.app/api/rss',
            site_url: 'https://daily-taho.vercel.app',
            image_url: 'https://daily-taho.vercel.app/dt-black.png',
            language: 'en',
            pubDate: new Date().toUTCString(),
            ttl: 60
        });

        topArticles.forEach(item => {
            const cleanText = (item.description || '').replace(/<[^>]*>?/gm, '').trim();
            const slug = generateSlug(item.title);
            const deepLink = `https://daily-taho.vercel.app/?article=${slug}`;

            feed.item({
                title: item.title,
                description: cleanText,
                url: deepLink, // Link to Daily Taho w/ slug
                guid: deepLink,
                date: item.pubDate,
                enclosure: item.imageUrl ? { url: item.imageUrl } : undefined,
                custom_elements: [
                    { 'source': item.sourceName },
                    { 'original_link': item.link } // Keep original link
                ]
            });
        });

        const xml = feed.xml({ indent: true });

        return new Response(
            xml,
            {
                status: 200,
                headers: {
                    'content-type': 'application/xml',
                    'cache-control': 'public, s-maxage=300, stale-while-revalidate=60',
                },
            }
        );
    } catch (e) {
        return new Response(
            `<error>${e.message}</error>`,
            { status: 500, headers: { 'content-type': 'application/xml' } }
        );
    }
}
