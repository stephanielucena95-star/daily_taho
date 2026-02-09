// Inline slug generation (external imports don't work reliably in Vercel serverless)
function generateSlug(title) {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
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

const WEIGHTED_KEYWORDS = {
    'Nagbabagang Balita': {
        weight: 10,
        keywords: ['phivolcs', 'pagasa', 'lindol', 'earthquake', 'magnitude', 'bulkan', 'volcano', 'bagyo', 'storm', 'lpa', 'signal', 'alert', 'breaking', 'nagbabaga', 'flash', 'urgent']
    },
    'Global': {
        weight: 9,
        keywords: ['trump', 'biden', 'harris', 'putin', 'xi jinping', 'ukraine', 'israel', 'gaza', 'russia', 'china', 'usa', 'america', 'un', 'nato', 'international', 'world']
    },
    'Pulitika': {
        weight: 8,
        keywords: ['pbbm', 'marcos', 'senado', 'senate', 'kongreso', 'congress', 'vp', 'duterte', 'election', 'batas', 'law', 'bill', 'halalan', 'comelec', 'malacañang']
    },
    'Teknolohiya': {
        weight: 7,
        keywords: ['gadget', 'smartphone', 'ai', 'apps', 'internet', 'cybersecurity', 'startup', 'tech', 'software', 'hardware', 'innovation', 'robot', 'computer']
    },
    'Showbiz': {
        weight: 5,
        keywords: ['actor', 'actress', 'celebrity', 'concert', 'pelikula', 'movie', 'k-pop', 'viral', 'trending', 'showbiz', 'star', 'drama', 'kapuso', 'kapamilya']
    },
    'Ekonomiya': {
        weight: 6,
        keywords: ['inflation', 'price', 'market', 'stock', 'peso', 'dollar', 'dbm', 'dof', 'neda', 'bsp', 'tax', 'business']
    },
    'Isports': {
        weight: 6,
        keywords: ['nba', 'pba', 'basketball', 'volleyball', 'boxing', 'mpl', 'game', 'score', 'tournament', 'championship']
    }
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

const getWeightedCategory = (item) => {
    const text = `${item.title} ${item.description || ''}`.toLowerCase();
    const scores = {};
    Object.keys(WEIGHTED_KEYWORDS).forEach(cat => scores[cat] = 0);
    Object.entries(WEIGHTED_KEYWORDS).forEach(([category, data]) => {
        if (data.keywords) {
            data.keywords.forEach(keyword => {
                const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'i');
                if (regex.test(text)) scores[category] += data.weight;
            });
        }
    });
    const candidates = Object.entries(scores).filter(([_, score]) => score > 0);
    if (candidates.length === 0) return 'Nagbabagang Balita';

    candidates.sort((a, b) => {
        if (b[1] !== a[1]) return b[1] - a[1];
        if (a[0] === 'Nagbabagang Balita') return -1;
        if (b[0] === 'Nagbabagang Balita') return 1;
        return 0;
    });
    return candidates[0][0];
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

        const topArticles = validated.slice(0, 10).map((item) => {
            const cleanText = (item.description || '').replace(/<[^>]*>?/gm, '').trim();
            const slug = generateSlug(item.title);

            return {
                id: slug,
                title: item.title,
                slug: slug,
                summary_en: cleanText,
                summary_ph: '',
                source_url: item.link,
                image_url: item.imageUrl || '',
                category: getWeightedCategory(item),
                pubDate: item.pubDate
            };
        });

        return new Response(
            JSON.stringify(topArticles),
            {
                status: 200,
                headers: {
                    'content-type': 'application/json',
                    'cache-control': 'public, s-maxage=300, stale-while-revalidate=60',
                },
            }
        );
    } catch (e) {
        return new Response(
            JSON.stringify({ error: 'Failed to fetch news', details: e.message }),
            { status: 500, headers: { 'content-type': 'application/json' } }
        );
    }
}
