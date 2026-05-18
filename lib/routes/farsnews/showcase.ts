import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { load } from 'cheerio';

export const route: Route = {
    path: '/showcase/:category?',
    categories: ['traditional-media'],
    example: '/farsnews/showcase',
    parameters: { category: 'Category slug from farsnews.ir/showcase URL' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [{
        source: ['farsnews.ir/showcase'],
        target: '/farsnews/showcase',
    }],
    name: 'Showcase',
    maintainers: ['github-oysl'],
    handler,
    description: 'Fars News showcase articles. Persian news agency.',
};

function extractHydrationData(html: string): any {
    const $ = load(html);
    const hydrationScript = $('script')
        .toArray()
        .map((script) => $(script).html())
        .find((html) => html?.includes('window.__hydrationDataString'));

    if (hydrationScript) {
        const match = /window\.__hydrationDataString\s*=\s*'([^']+)'/.exec(hydrationScript);
        if (match) {
            try {
                return JSON.parse(match[1]);
            } catch {
                return null;
            }
        }
    }
    return null;
}

async function handler(ctx) {
    const category = ctx.req.param('category') ?? '';
    const baseUrl = 'https://farsnews.ir';
    const currentUrl = category ? `${baseUrl}/showcase/${category}` : `${baseUrl}/showcase`;

    const response = await got({ method: 'get', url: currentUrl });
    const hydrationData = extractHydrationData(response.data);

    // Try to get articles from hydration data first
    let items: any[] = [];
    if (hydrationData?.articles) {
        items = hydrationData.articles.map((article: any) => ({
            title: article.title || '',
            link: article.url ? `${baseUrl}${article.url}` : `${baseUrl}/showcase`,
            pubDate: article.published_at ? parseDate(article.published_at) : undefined,
            description: article.lead || article.summary || '',
        }));
    } else if (hydrationData?.showcase?.articles) {
        items = hydrationData.showcase.articles.map((article: any) => ({
            title: article.title || '',
            link: article.url ? `${baseUrl}${article.url}` : `${baseUrl}/showcase`,
            pubDate: article.published_at ? parseDate(article.published_at) : undefined,
            description: article.lead || article.summary || '',
        }));
    } else if (hydrationData?.data?.articles) {
        items = hydrationData.data.articles.map((article: any) => ({
            title: article.title || '',
            link: article.url ? `${baseUrl}${article.url}` : `${baseUrl}/showcase`,
            pubDate: article.published_at ? parseDate(article.published_at) : undefined,
            description: article.lead || article.summary || '',
        }));
    }

    // Fallback to cheerio if hydration data doesn't contain articles
    if (items.length === 0) {
        const $ = load(response.data);
        items = $('a[href^="/"]')
            .toArray()
            .map((item) => {
                item = $(item);
                const href = item.attr('href');
                const title = item.find('h2, h3').first().text().trim() || item.text().trim();

                if (!href || !title || !/^\/[^/]+\/\d+\//.test(href)) {
                    return null;
                }

                return {
                    title,
                    link: `${baseUrl}${href}`,
                };
            })
            .filter((item) => item !== null)
            .filter((item, index, self) => self.findIndex((i) => i.link === item.link) === index);
    }

    // Fetch detail pages for full description if not available from list
    const processedItems = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                // Skip detail fetch if we already have description from list page
                if (item.description && item.description.length > 50) {
                    return item;
                }

                const detailResponse = await got({ method: 'get', url: item.link });
                const detailHydration = extractHydrationData(detailResponse.data);

                if (detailHydration) {
                    const articleBody = detailHydration?.article?.body || detailHydration?.content?.body || detailHydration?.data?.article?.body || '';
                    if (articleBody) {
                        item.description = articleBody;
                    }
                }

                // Fallback to meta description
                if (!item.description) {
                    const detail$ = load(detailResponse.data);
                    item.description = detail$('meta[name="description"]').attr('content') || '';
                }

                // Extract pubDate from detail page if not available from list
                if (!item.pubDate) {
                    const detail$ = load(detailResponse.data);
                    const timeText = detail$('time').attr('datetime') || detail$('.text-gray-400').first().text();
                    if (timeText) {
                        item.pubDate = parseDate(timeText);
                    }
                }

                return item;
            })
        )
    );

    return {
        title: 'Fars News - Showcase',
        link: currentUrl,
        item: processedItems,
    };
}
