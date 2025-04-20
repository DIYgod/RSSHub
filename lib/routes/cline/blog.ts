import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import logger from '@/utils/logger';

async function handler() {
    const rootUrl = 'https://cline.bot';
    const currentUrl = `${rootUrl}/blog`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    // Search for script contents containing blog data in the Response
    const scriptContents = $('script')
        .toArray()
        .map((script) => $(script).html());

    // Store parsed article information
    let articles = [];

    // Try to extract article data from script contents
    for (const content of scriptContents) {
        if (content && content.includes('_next/image?url=https')) {
            try {
                // Extract article image URLs, titles, dates, authors and links
                const imgRegex = /_next\/image\?url=(https%3A%2F%2Fcline\.ghost\.io%2Fcontent%2Fimages%2F[^"&]+)/g;
                const titleRegex = /text-brand-black font-mono group-hover:text-brand-blue[^>]*>([^<]+)<\/h2>/g;
                const dateRegex = /<span class="mx-2">•<\/span><span>([^<]+)<\/span>/g;
                const authorRegex = /<span>([^<]+)<\/span><span class="mx-2">•<\/span>/g;
                const linkRegex = /href="(\/blog\/[^"]+)"/g;
                const summaryRegex = /text-slate-600 font-sans text-sm flex-1 line-clamp-3[^>]*>([^<]+)</g;

                // Extract all matches
                const imageURLs = [...content.matchAll(imgRegex)].map((m) => decodeURIComponent(m[1]));
                const titles = [...content.matchAll(titleRegex)].map((m) => m[1]);
                const dates = [...content.matchAll(dateRegex)].map((m) => m[1]);
                const authors = [...content.matchAll(authorRegex)].map((m) => m[1]);
                const links = [...content.matchAll(linkRegex)].map((m) => `${rootUrl}${m[1]}`);
                const summaries = [...content.matchAll(summaryRegex)].map((m) => m[1]);

                // If extracted data is reasonable, build article list
                if (titles.length > 0 && links.length > 0 && titles.length === links.length) {
                    for (const [i, title] of titles.entries()) {
                        articles.push({
                            title,
                            link: links[i],
                            pubDate: dates[i] ? parseDate(dates[i]) : undefined,
                            author: authors[i] || undefined,
                            description: `<img src="${imageURLs[i] || ''}" /><p>${summaries[i] || ''}</p>`,
                        });
                    }
                    // If successfully extracted article list, break the loop
                    if (articles.length > 0) {
                        break;
                    }
                }
            } catch (error) {
                // Catch and ignore parsing errors
                logger.error('Error parsing blog data from script:', error);
            }
        }
    }

    // If failed to get articles by parsing scripts, try to extract directly from DOM
    if (articles.length === 0) {
        articles = $('article')
            .toArray()
            .map((article) => {
                const element = $(article);

                // Extract title
                const titleEl = element.find('h2').first();
                const title = titleEl.text().trim();

                // Extract link
                const linkEl = element.find('a').first();
                const link = linkEl.attr('href');
                const fullLink = link ? (link.startsWith('http') ? link : `${rootUrl}${link.startsWith('/') ? link : `/${link}`}`) : '';

                // Extract author and date
                const metaEl = element.find('.text-xs.text-slate-500');
                const authorEl = metaEl.find('span').first();
                const author = authorEl.text().trim();

                const dateEl = metaEl.find('span').eq(2); // Usually the third span (index 2)
                const dateStr = dateEl.text().trim();
                const pubDate = dateStr ? parseDate(dateStr) : undefined;

                // Extract summary
                const summaryEl = element.find('.text-slate-600');
                const summary = summaryEl.text().trim();

                // Extract image
                const imgEl = element.find('img');
                const imgSrc = imgEl.attr('src') || '';

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

    // If still no articles found, provide a fallback content
    if (articles.length === 0) {
        articles = [
            {
                title: 'Cline Official Blog',
                link: currentUrl,
                description: 'Unable to fetch Cline blog articles. Please visit the official blog directly.',
            },
        ];
    }

    // Get article details
    const items = await Promise.all(
        articles.map((item) =>
            cache.tryGet(item.link, async () => {
                try {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });

                    const content = load(detailResponse.data);

                    // Find article content
                    const articleContent = content('main article, .blog-post-content, .article-content');

                    let description = item.description;
                    if (articleContent.length > 0) {
                        // Process image and link paths in article content
                        let contentHtml = articleContent.html() || '';
                        contentHtml = contentHtml.replaceAll('src="/', `src="${rootUrl}/`);
                        contentHtml = contentHtml.replaceAll('href="/', `href="${rootUrl}/`);
                        description = contentHtml;
                    }

                    return {
                        title: item.title,
                        description,
                        link: item.link,
                        pubDate: item.pubDate,
                        author: item.author,
                    };
                } catch {
                    return item; // If failed to get details, return original item
                }
            })
        )
    );

    return {
        title: 'Cline Official Blog',
        link: currentUrl,
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
