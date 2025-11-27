import { type CheerioAPI, load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://cline.bot';
const blogUrl = `${rootUrl}/blog`;

// Extract article information from DOM
function extractArticlesFromDOM($: CheerioAPI): DataItem[] {
    return $('article.group')
        .toArray()
        .map((article) => {
            const element = $(article);

            const title = element.find('h2').text().trim();
            const link = element.find('a').first().attr('href');
            const fullLink = link ? (link.startsWith('http') ? link : `${rootUrl}${link.startsWith('/') ? link : `/${link}`}`) : '';

            // Extract date and author with single regex
            const metaText = element.find('.text-sm.text-slate-500').text().trim();
            const metaMatch = metaText.match(/^([^•]+)\s*•\s*([A-Za-z]+\s+\d{1,2},?\s+\d{4})/);
            const author = metaMatch ? metaMatch[1].trim() : 'Cline Team';
            const pubDate = metaMatch ? parseDate(metaMatch[2]) : undefined;

            const summary = element.find('p.text-slate-600').text().trim();
            const imgSrc = element.find('img').attr('src') || '';

            return title && link
                ? {
                      title,
                      link: fullLink,
                      pubDate,
                      author,
                      description: imgSrc ? `<img src="${imgSrc}" alt="${title}" /><p>${summary}</p>` : `<p>${summary}</p>`,
                  }
                : null;
        })
        .filter(Boolean) as DataItem[];
}

async function handler() {
    // Use the archive page which has all articles
    const archiveUrl = `${rootUrl}/blog/archive`;

    const response = await got({
        method: 'get',
        url: archiveUrl,
    });

    const $ = load(response.data);
    const articles = extractArticlesFromDOM($);

    if (articles.length === 0) {
        throw new Error('No articles found.');
    }

    return {
        title: 'Cline Official Blog',
        link: blogUrl,
        item: articles,
        description: 'Cline Official Blog - AI Coding Assistant',
        language: 'en' as const,
    };
}

export const route: Route = {
    path: '/blog',
    categories: ['blog'],
    example: '/cline/blog',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['cline.bot/blog/archive', 'cline.bot/blog'],
            target: '/blog',
        },
    ],
    name: 'Blog',
    maintainers: ['yeshan333'],
    description: 'Cline Official Blog articles',
    handler,
    url: 'cline.bot/blog',
};
