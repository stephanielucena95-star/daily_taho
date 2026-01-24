
export enum NewsCategory {
  ALL = 'Lahat',
  BREAKING = 'Nagbabagang Balita',
  POLITICS = 'Pulitika',
  ECONOMY = 'Ekonomiya',
  SPORTS = 'Isports',
  ENTERTAINMENT = 'Showbiz',
  TEKNOLOHIYA = 'Teknolohiya',
  GLOBAL = 'Global'
}

export interface NewsSource {
  name: string;
  icon?: string; // URL or Initials
}

export interface Article {
  id: string;
  title: string;
  source: NewsSource;
  category: NewsCategory;
  publishTime: string; // e.g., "2 hours ago"
  readTime: string; // e.g., "5 min read"
  imageUrl: string;
  summaryEnglish: string; 
  summaryFilipino?: string; 
  tags?: string[];
  url: string;
}
