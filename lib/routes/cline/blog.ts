import { load, type CheerioAPI } from 'cheerio';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { Route, DataItem } from '@/types';

const rootUrl = 'https://cline.bot';
const blogUrl = `${rootUrl}/blog`;

// Extract article information from DOM
function extractArticlesFromDOM($: CheerioAPI): DataItem[] {
    const articles: DataItem[] = [];

    // Archive page structure - articles in chronological list
    $('div.group > div.space-y-4 > div.group').each((_, article) => {
        const element = $(article);

        // Title and link
        const titleEl = element.find('h3.text-lg.font-semibold.text-gray-900 a, a.text-gray-900');
        const title = titleEl.text().trim();
        const link = titleEl.attr('href') || element.find('a[href*="/blog/"]').attr('href');
        const fullLink = link ? (link.startsWith('http') ? link : `${rootUrl}${link.startsWith('/') ? link : `/${link}`}`) : '';

        // Date extraction from format like "Aug 12, 2024"
        const dateEl = element.find('div.text-sm.text-gray-500');
        const dateStr = dateEl.text().trim();
        const pubDate = dateStr ? parseDate(dateStr) : undefined;

        // Description
        const summary = element.find('p.text-gray-600').text().trim();

        if (title && link) {
            articles.push({
                title,
                link: fullLink,
                pubDate,
                author: 'Cline Team',
                description: `<p>${summary}</p>`,
            });
        }
    });

    // Fallback: try main blog page structure if archive doesn't work
    if (articles.length === 0) {
        // Main blog page structure
        $('article.group').each((_, article) => {
            const element = $(article);

            const title = element.find('h2, h3').text().trim();
            const link = element.find('a').first().attr('href');
            const fullLink = link ? (link.startsWith('http') ? link : `${rootUrl}${link.startsWith('/') ? link : `/${link}`}`) : '';

            // Extract date and author
            const metaText = element.find('.text-sm.text-slate-500, .text-xs.text-slate-500').text().trim();
            const dateMatch = metaText.match(/(?:\w+\s*•\s*)?([A-Za-z]+\s+\d{1,2},?\s+\d{4})/);
            const pubDate = dateMatch ? parseDate(dateMatch[1]) : undefined;

            const authorMatch = metaText.match(/^([^•]+)•/);
            const author = authorMatch ? authorMatch[1].trim() : 'Cline Team';

            const summary = element.find('p.text-slate-600, p.text-slate-700').text().trim();
            const imgSrc = element.find('img').attr('src') || '';

            if (title && link) {
                articles.push({
                    title,
                    link: fullLink,
                    pubDate,
                    author,
                    description: (imgSrc ? `<img src="${imgSrc}" alt="${title}" />` : '') + `<p>${summary}</p>`,
                });
            }
        });
    }

    return articles.filter((item) => item.title && item.link);
}

async function handler() {
    // Use the archive page which has all articles
    const archiveUrl = `${rootUrl}/blog/archive`;

    try {
        const response = await got({
            method: 'get',
            url: archiveUrl,
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; RSSHub/1.0)',
            },
        });

        const $ = load(response.data);
        const articles = extractArticlesFromDOM($);

        if (articles.length === 0) {
            throw new Error('No articles found.');
        }

        // Sort by date (newest first)
        articles.sort((a, b) => {
            if (!a.pubDate || !b.pubDate) {return 0;}
            return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
        });

        return {
            title: 'Cline Official Blog',
            link: blogUrl,
            item: articles,
            description: 'Cline Official Blog - AI Coding Assistant',
            language: 'en' as const,
        };
    } catch (error: any) {
        throw new Error(`Failed to fetch blog: ${error.message}`);
    }
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
        {
            source: ['cline.bot/blog/archive'],
            target: '/blog',
        },
    ],
    name: 'Blog',
    maintainers: ['yeshan333'],
    description: 'Cline Official Blog articles',
    handler,
    url: 'cline.bot/blog',
};
