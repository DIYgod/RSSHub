import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import logger from '@/utils/logger';

interface Article {
    title: string;
    link: string;
    pubDate?: Date;
    author?: string;
    description: string;
}

const rootUrl = 'https://cline.bot';
const blogUrl = `${rootUrl}/blog`;

// Extract article information from DOM
function extractArticlesFromDOM($) {
    return $('article')
        .toArray()
        .map((article) => {
            const element = $(article);
            const title = element.find('h2').first().text().trim();
            const linkEl = element.find('a').first();
            const link = linkEl.attr('href');
            const fullLink = link ? (link.startsWith('http') ? link : `${rootUrl}${link.startsWith('/') ? link : `/${link}`}`) : '';

            const metaEl = element.find('.text-xs.text-slate-500');
            const author = metaEl.find('span').first().text().trim();
            const dateStr = metaEl.find('span').eq(2).text().trim();
            const pubDate = dateStr ? parseDate(dateStr) : undefined;

            const summary = element.find('.text-slate-600').text().trim();
            const imgSrc = element.find('img').attr('src') || '';

            return {
                title,
                link: fullLink,
                pubDate,
                author,
                description: `<img src="${imgSrc}" /><p>${summary}</p>`,
            };
        })
        .filter((item) => item.title && item.link);
}

// Extract article information from script content
function extractArticlesFromScript(scriptContent: string): Article[] {
    if (!scriptContent || !scriptContent.includes('_next/image?url=https')) {
        return [];
    }

    try {
        // Extract various information using regex
        const imgRegex = /_next\/image\?url=(https%3A%2F%2Fcline\.ghost\.io%2Fcontent%2Fimages%2F[^"&]+)/g;
        const titleRegex = /text-brand-black font-mono group-hover:text-brand-blue[^>]*>([^<]+)<\/h2>/g;
        const dateRegex = /<span class="mx-2">•<\/span><span>([^<]+)<\/span>/g;
        const authorRegex = /<span>([^<]+)<\/span><span class="mx-2">•<\/span>/g;
        const linkRegex = /href="(\/blog\/[^"]+)"/g;
        const summaryRegex = /text-slate-600 font-sans text-sm flex-1 line-clamp-3[^>]*>([^<]+)</g;

        const imageURLs = [...scriptContent.matchAll(imgRegex)].map((m) => decodeURIComponent(m[1]));
        const titles = [...scriptContent.matchAll(titleRegex)].map((m) => m[1]);
        const dates = [...scriptContent.matchAll(dateRegex)].map((m) => m[1]);
        const authors = [...scriptContent.matchAll(authorRegex)].map((m) => m[1]);
        const links = [...scriptContent.matchAll(linkRegex)].map((m) => `${rootUrl}${m[1]}`);
        const summaries = [...scriptContent.matchAll(summaryRegex)].map((m) => m[1]);

        // Only build article list if enough information is extracted
        if (titles.length > 0 && links.length > 0 && titles.length === links.length) {
            return titles.map((title, i) => ({
                title,
                link: links[i],
                pubDate: dates[i] ? parseDate(dates[i]) : undefined,
                author: authors[i] || undefined,
                description: `<img src="${imageURLs[i] || ''}" /><p>${summaries[i] || ''}</p>`,
            }));
        }
    } catch (error) {
        logger.error('Error parsing blog data from script:', error);
    }

    return [];
}

// Fetch article detail content
async function fetchArticleDetail(article: Article): Promise<Article> {
    try {
        const detailResponse = await got({
            method: 'get',
            url: article.link,
        });

        const content = load(detailResponse.data);
        const articleContent = content('main article, .blog-post-content, .article-content');

        if (articleContent.length > 0) {
            let contentHtml = articleContent.html() || '';
            contentHtml = contentHtml.replaceAll('src="/', `src="${rootUrl}/`).replaceAll('href="/', `href="${rootUrl}/`);

            return {
                ...article,
                description: contentHtml,
            };
        }
    } catch {
        // If fetching detail fails, return original article
    }

    return article;
}

async function handler() {
    // Get blog homepage
    const response = await got({
        method: 'get',
        url: blogUrl,
    });

    const $ = load(response.data);

    // First try to extract articles from script
    let articles: Article[] = [];

    const scriptContents = $('script')
        .toArray()
        .map((script) => $(script).html());

    // Iterate through all script contents to extract article information
    for (const content of scriptContents) {
        if (content) {
            const extractedArticles = extractArticlesFromScript(content);
            if (extractedArticles.length > 0) {
                articles = extractedArticles;
                break;
            }
        }
    }

    // If extraction from script fails, try extracting from DOM
    if (articles.length === 0) {
        articles = extractArticlesFromDOM($);
    }

    // If still no articles, provide a fallback content
    if (articles.length === 0) {
        articles = [
            {
                title: 'Cline Official Blog',
                link: blogUrl,
                description: 'Unable to fetch Cline blog articles. Please visit the official blog directly.',
            },
        ];
    }

    // Fetch article details
    const items = await Promise.all(articles.map((article) => cache.tryGet(article.link, () => fetchArticleDetail(article))));

    return {
        title: 'Cline Official Blog',
        link: blogUrl,
        item: items,
        description: 'Cline Official Blog - AI Coding Assistant',
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
    name: 'Blog',
    maintainers: ['GitHub-Copilot'],
    description: `Cline Official Blog articles`,
    handler,
    url: 'cline.bot/blog',
};
