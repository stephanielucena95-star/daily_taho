
import { Article, NewsCategory } from './types';

export const RSS_FEEDS = {
  GMA: 'https://data.gmanetwork.com/gno/rss/news/feed.xml',
  INQUIRER: 'https://newsinfo.inquirer.net/feed',
  PHILSTAR: 'https://www.philstar.com/rss/headlines',
  RAPPLER: 'https://www.rappler.com/feed/',
  NEWS5: 'https://www.interaksyon.com/feed/',
  'MANILA TIMES': 'https://www.manilatimes.net/news/feed',
  'DAILY TRIBUNE': 'https://tribune.net.ph/feed/',
  'BUSINESSWORLD': 'https://www.bworldonline.com/feed/'
};

export const PUBLISHER_HOME_PAGES: Record<string, string> = {
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

export const CATEGORY_THEME: Record<NewsCategory, { bg: string; text: string }> = {
  [NewsCategory.ALL]: { bg: '#18181b', text: '#ffffff' }, // Black
  [NewsCategory.BREAKING]: { bg: '#ef4444', text: '#ffffff' }, // Modern Red
  [NewsCategory.POLITICS]: { bg: '#27272a', text: '#ffffff' }, // Dark Zinc
  [NewsCategory.ECONOMY]: { bg: '#f59e0b', text: '#ffffff' }, // Amber
  [NewsCategory.SPORTS]: { bg: '#10b981', text: '#ffffff' }, // Emerald
  [NewsCategory.ENTERTAINMENT]: { bg: '#db2777', text: '#ffffff' }, // Rose
  [NewsCategory.TEKNOLOHIYA]: { bg: '#6366f1', text: '#ffffff' }, // Indigo
  [NewsCategory.GLOBAL]: { bg: '#52525b', text: '#ffffff' }, // Zinc
};

export const MOCK_ARTICLES: Article[] = [
  {
    id: 'm1',
    title: 'Welcome to Daily Taho: Your Reliable News Hub',
    source: { name: 'System' },
    category: NewsCategory.ALL,
    publishTime: 'Just now',
    readTime: '1 min read',
    imageUrl: '',
    summaryEnglish: 'Daily Taho provides high-speed news summaries directly from verified Philippine RSS sources. Using the Container-First approach, we ensure that you get legitimate headlines without the clutter of ads or trackers.',
    summaryFilipino: 'Ang Daily Taho ay nagbibigay ng mabilis na buod ng balita mula sa mga beripikadong RSS sources sa Pilipinas. Gamit ang Container-First approach, tinitiyak namin na lehitimong balita ang iyong matatanggap.',
    url: 'https://www.google.com'
  }
];

export const CATEGORIES = [
  NewsCategory.ALL,
  NewsCategory.BREAKING,
  NewsCategory.POLITICS,
  NewsCategory.ECONOMY,
  NewsCategory.SPORTS,
  NewsCategory.ENTERTAINMENT,
  NewsCategory.TEKNOLOHIYA,
  NewsCategory.GLOBAL,
];

// NEW: Weighted Scoring Taxonomy
export const WEIGHTED_KEYWORDS: Record<string, { keywords: string[], weight: number }> = {
  [NewsCategory.BREAKING]: {
    weight: 10,
    keywords: ['phivolcs', 'pagasa', 'lindol', 'earthquake', 'magnitude', 'bulkan', 'volcano', 'bagyo', 'storm', 'lpa', 'signal', 'alert', 'breaking', 'nagbabaga', 'flash', 'urgent']
  },
  [NewsCategory.GLOBAL]: {
    weight: 9,
    keywords: ['trump', 'biden', 'harris', 'putin', 'xi jinping', 'ukraine', 'israel', 'gaza', 'russia', 'china', 'usa', 'america', 'un', 'nato', 'international', 'world']
  },
  [NewsCategory.POLITICS]: {
    weight: 8,
    keywords: ['pbbm', 'marcos', 'senado', 'senate', 'kongreso', 'congress', 'vp', 'duterte', 'election', 'batas', 'law', 'bill', 'halalan', 'comelec', 'malacañang']
  },
  [NewsCategory.TEKNOLOHIYA]: {
    weight: 7,
    keywords: ['gadget', 'smartphone', 'ai', 'apps', 'internet', 'cybersecurity', 'startup', 'tech', 'software', 'hardware', 'innovation', 'robot', 'computer']
  },
  [NewsCategory.ENTERTAINMENT]: {
    weight: 5,
    keywords: ['actor', 'actress', 'celebrity', 'concert', 'pelikula', 'movie', 'k-pop', 'viral', 'trending', 'showbiz', 'star', 'drama', 'kapuso', 'kapamilya']
  },
  [NewsCategory.ECONOMY]: {
    weight: 6,
    keywords: ['inflation', 'price', 'market', 'stock', 'peso', 'dollar', 'dbm', 'dof', 'neda', 'bsp', 'tax', 'business']
  },
  [NewsCategory.SPORTS]: {
    weight: 6,
    keywords: ['nba', 'pba', 'basketball', 'volleyball', 'boxing', 'mpl', 'game', 'score', 'tournament', 'championship']
  }
};
