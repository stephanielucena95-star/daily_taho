
import { Article, NewsCategory } from './types';

export const RSS_FEEDS = {
  GMA: 'https://www.gmanetwork.com/news/rss/',
  INQUIRER: 'https://newsinfo.inquirer.net/feed',
  PHILSTAR: 'https://www.philstar.com/rss/headlines',
  MB: 'https://mb.com.ph/feed',
  RAPPLER: 'https://www.rappler.com/feed/'
};

export const PUBLISHER_HOME_PAGES: Record<string, string> = {
  'GMA News': 'https://www.gmanetwork.com/news/',
  'Inquirer': 'https://newsinfo.inquirer.net',
  'PhilStar': 'https://www.philstar.com',
  'Manila Bulletin': 'https://mb.com.ph',
  'Rappler': 'https://www.rappler.com',
  'GMA': 'https://www.gmanetwork.com/news/',
  'Philstar.com': 'https://www.philstar.com'
};

export const CATEGORY_THEME: Record<NewsCategory, { bg: string; text: string }> = {
  [NewsCategory.ALL]: { bg: '#1f2937', text: '#ffffff' },
  [NewsCategory.BREAKING]: { bg: '#fb3640', text: '#ffffff' },
  [NewsCategory.POLITICS]: { bg: '#131316', text: '#ffffff' },
  [NewsCategory.ECONOMY]: { bg: '#fecb34', text: '#131316' },
  [NewsCategory.SPORTS]: { bg: '#2563eb', text: '#ffffff' },
  [NewsCategory.ENTERTAINMENT]: { bg: '#58158e', text: '#ffffff' },
  [NewsCategory.TEKNOLOHIYA]: { bg: '#0ea5e9', text: '#ffffff' },
  [NewsCategory.GLOBAL]: { bg: '#131316', text: '#ffffff' },
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

export const CATEGORY_KEYWORDS: Record<NewsCategory, string[]> = {
  [NewsCategory.ALL]: [],
  [NewsCategory.BREAKING]: [], // Usually handled by recency/source, but can add urgent keywords
  [NewsCategory.POLITICS]: ['senate', 'congress', 'president', 'marcos', 'duterte', 'law', 'bill', 'batang q', 'government', 'halalan', 'election', 'court', 'pbbu', 'policy', 'official', 'department'],
  [NewsCategory.ECONOMY]: ['inflation', 'price', 'market', 'stock', 'peso', 'dollar', 'dbm', 'dof', 'neda', 'bsp', 'tax', 'business', 'economy', 'trade', 'investment', 'presyo', 'ili', 'bank'],
  [NewsCategory.SPORTS]: ['nba', 'pba', 'basketball', 'volleyball', 'boxing', 'mpl', 'ginebra', 'magnolia', 'san miguel', 'olympics', 'fiba', 'game', 'score', 'tournament', 'championship', 'athlete'],
  [NewsCategory.ENTERTAINMENT]: ['showbiz', 'celebrity', 'movie', 'film', 'concert', 'actor', 'actress', 'star', 'drama', 'kapuso', 'kapamilya', 'gma', 'abs-cbn', 'entertainment', 'idol'],
  [NewsCategory.TEKNOLOHIYA]: ['tech', 'gadget', 'phone', 'app', 'ai', 'cyber', 'internet', 'digital', 'software', 'hardware', 'science', 'space', 'innovation', 'robot', 'computer'],
  [NewsCategory.GLOBAL]: ['us ', 'china', 'japan', 'ukraine', 'russia', 'gaza', 'israel', 'un', 'world', 'international', 'foreign', 'trump', 'biden', 'war', 'global'],
};
