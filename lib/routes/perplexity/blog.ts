import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';
import type { BrowserContext } from 'patchright';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import { getPlaywrightPage } from '@/utils/playwright';

const readContentPage = async (context: BrowserContext, url: string): Promise<string> => {
    const page = await context.newPage();
    try {
        await page.route('**/*', (route) => {
            route.request().resourceType() === 'document' ? route.continue() : route.abort();
        });
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        return await page.evaluate(() => document.documentElement.getHTML());
    } finally {
        await page.close();
    }
};

export const route: Route = {
    path: '/blog',
    example: '/perplexity/blog',
    url: 'www.perplexity.ai',
    categories: ['blog'],
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.perplexity.ai/hub/blog'],
            target: '/blog',
        },
    ],
    name: 'Blog',
    maintainers: ['seeyangzhi'],
    handler,
    description: "Perplexity Blog - Explore Perplexity's blog for articles, announcements, product updates, and tips to optimize your experience. Stay informed and make the most of Perplexity.",
    view: ViewType.Notifications,
};

async function handler(ctx: Context) {
    const requestedLimit = Number(ctx.req.query('limit'));
    const limit = Number.isSafeInteger(requestedLimit) && requestedLimit > 0 ? requestedLimit : 20;
    const rootUrl = 'https://www.perplexity.ai/hub/blog';

    const { page, destroy, context } = await getPlaywrightPage(rootUrl, {
        closeTimeout: 0,
        onBeforeLoad: async (page) => {
            await page.route('**/*', (route) => {
                const request = route.request();
                request.resourceType() === 'document' ? route.continue() : route.abort();
            });
        },
    });

    try {
        const html = await page.evaluate(() => document.documentElement.getHTML());
        const $ = load(html);

        const items: DataItem[] = [];

        const seenLinks = new Set<string>();

        // Step 1: Extract featured article using data-framer-name attribute
        const featuredCard = $('[data-framer-name="Featured Card"]').first();
        const featuredHref = featuredCard.find('a[href^="./blog/"]').attr('href');
        const featuredTitle = featuredCard.find('h4').first().text();

        if (featuredHref && featuredTitle.trim()) {
            const link = new URL(featuredHref, rootUrl).href;
            seenLinks.add(link);
            items.push({
                link,
                title: featuredTitle,
            });
        }

        // Step 2: Extract regular articles using data-framer-name="Article Card"
        for (const element of $('[data-framer-name="Article Card"]').toArray()) {
            const $card = $(element);
            const href = $card.attr('href');
            const title = $card.find('h6').first().text();

            if (!href || !title.trim()) {
                continue;
            }

            const link = new URL(href, rootUrl).href;

            if (seenLinks.has(link)) {
                continue;
            }
            seenLinks.add(link);

            // First <p> contains the date, subsequent <p> elements are categories
            const paragraphs = $card.find('p').toArray();
            const dateText = paragraphs.length > 0 ? $(paragraphs[0]).text().trim() : '';
            const pubDate = dateText ? parseDate(dateText) : undefined;

            const category = paragraphs
                .slice(1)
                .map((p) => $(p).text().trim())
                .filter(Boolean);

            items.push({
                link,
                title,
                pubDate,
                category: category.length > 0 ? category : undefined,
            });
        }

        // Step 3: Fetch detail pages for items missing pubDate (e.g., featured article)
        // and extract article content for description
        const resultItems = await pMap(
            items.slice(0, limit),
            async (item) => {
                if (!item.link) {
                    return item;
                }

                return await cache.tryGet<DataItem>(item.link, async () => {
                    const contentHtml = await readContentPage(context, item.link!);

                    const $content = load(contentHtml);

                    let pubDate: string | number | Date | undefined = item.pubDate ?? undefined;
                    if (!pubDate) {
                        const timeEl = $content('time[datetime]').first();
                        if (timeEl.length) {
                            pubDate = parseDate(timeEl.attr('datetime')!);
                        }
                    }

                    $content('style, noscript').remove();

                    const contentArea = $content('[data-framer-name="Content"]').first();
                    const description = contentArea.length ? contentArea.html() : undefined;

                    return {
                        ...item,
                        pubDate,
                        description,
                    };
                });
            },
            { concurrency: 3 }
        );

        return {
            title: 'Perplexity Blog',
            link: rootUrl,
            item: resultItems,
            language: 'en',
        } satisfies Data;
    } finally {
        await destroy();
    }
}
