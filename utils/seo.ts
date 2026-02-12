
import { Article } from '../types';

const SITE_NAME = 'Daily Taho';
const SITE_TITLE = 'Daily Taho | Legitimate PH News Summaries';
const DEFAULT_DESC = 'Fast PH news summaries curated by AI from trusted sources.';
const DEFAULT_IMAGE = 'https://daily-taho.vercel.app/dt-black.png';
const BASE_URL = 'https://daily-taho.vercel.app';

export const updateSEO = (article: Article | null) => {
    const title = article ? `${article.title} | ${SITE_NAME}` : SITE_TITLE;
    const description = article ? (article.summaryShort || article.summaryEnglish).substring(0, 160) : DEFAULT_DESC;
    const url = article ? `${BASE_URL}/?article=${article.slug}` : BASE_URL;
    const image = article?.imageUrl || DEFAULT_IMAGE;

    // Update basic tags
    document.title = title;
    updateMetaTag('description', description);

    // Update Open Graph tags
    updateMetaProperty('og:title', title);
    updateMetaProperty('og:description', description);
    updateMetaProperty('og:url', url);
    updateMetaProperty('og:image', image);

    // Update Twitter tags
    updateMetaProperty('twitter:title', title);
    updateMetaProperty('twitter:description', description);
    updateMetaProperty('twitter:url', url);
    updateMetaProperty('twitter:image', image);

    // Update Canonical
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);

    // Update Structured Data (JSON-LD)
    updateStructuredData(article);
};

const updateMetaTag = (name: string, content: string) => {
    let tag = document.querySelector(`meta[name="${name}"]`);
    if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', name);
        document.head.appendChild(tag);
    }
    tag.setAttribute('content', content);
};

const updateMetaProperty = (property: string, content: string) => {
    let tag = document.querySelector(`meta[property="${property}"]`);
    if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
    }
    tag.setAttribute('content', content);
};

const updateStructuredData = (article: Article | null) => {
    // Remove existing LD+JSON
    const existing = document.getElementById('seo-structured-data');
    if (existing) existing.remove();

    const ldJson: any = {
        '@context': 'https://schema.org',
    };

    if (article) {
        ldJson['@type'] = 'NewsArticle';
        ldJson['headline'] = article.title;
        ldJson['image'] = [article.imageUrl || DEFAULT_IMAGE];
        ldJson['datePublished'] = new Date().toISOString(); // Ideal if we have pubDate but article might not have exact ISO
        ldJson['author'] = [{
            '@type': 'Organization',
            'name': article.source.name,
            'url': BASE_URL
        }];
        ldJson['publisher'] = {
            '@type': 'Organization',
            'name': SITE_NAME,
            'logo': {
                '@type': 'ImageObject',
                'url': DEFAULT_IMAGE
            }
        };
    } else {
        ldJson['@type'] = 'WebSite';
        ldJson['name'] = SITE_NAME;
        ldJson['url'] = BASE_URL;
        ldJson['description'] = DEFAULT_DESC;
    }

    const script = document.createElement('script');
    script.id = 'seo-structured-data';
    script.type = 'application/ld+json';
    script.text = JSON.stringify(ldJson);
    document.head.appendChild(script);
};
