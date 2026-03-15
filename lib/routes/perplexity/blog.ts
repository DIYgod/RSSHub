import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import { getPuppeteerPage } from '@/utils/puppeteer';

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
            source: ['www.perplexity.ai/hub'],
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
    const limit = Number.parseInt(ctx.req.query('limit') ?? '20', 10);
    const rootUrl = 'https://www.perplexity.ai/hub';

    const { page, destory, browser } = await getPuppeteerPage(rootUrl, {
        onBeforeLoad: async (page) => {
            await page.setRequestInterception(true);
            page.on('request', (request) => {
                request.resourceType() === 'document' ? request.continue() : request.abort();
            });
        },
    });

    const html = await page.evaluate(() => document.documentElement.innerHTML);
    const $ = load(html);

    const items: DataItem[] = [];
    const seenLinks = new Set<string>();

    // Step 1: Extract featured article using data-framer-name attribute
    const featuredCard = $('[data-framer-name="Featured Card"]').first();
    const featuredHref = featuredCard.find('a[href^="./hub/blog/"]').first().attr('href');
    const featuredTitle = featuredCard.find('h4').first().text().trim();

    if (featuredHref && featuredTitle) {
        const link = new URL(featuredHref, rootUrl).href;
        seenLinks.add(link);
        items.push({
            link,
            title: featuredTitle,
        });
    }

    // Step 2: Extract regular articles using data-framer-name="Article Card"
    // The Article Card IS the anchor tag itself (has href directly)
    // Deduplication is needed because server-rendered HTML may contain duplicates
    for (const element of $('[data-framer-name="Article Card"]').toArray()) {
        const $card = $(element);
        const href = $card.attr('href');
        const title = $card.find('h6').first().text().trim();

        if (!href || !title) {
            continue;
        }

        const link = new URL(href, rootUrl).href;

        // Skip duplicates (server-rendered HTML may have duplicate Article Cards)
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
    const resultItems = await Promise.all(
        items.slice(0, limit).map(async (item) => {
            if (!item.link) {
                return item;
            }

            return (await cache.tryGet(item.link, async () => {
                const contentPage = await browser.newPage();

                await contentPage.setRequestInterception(true);
                contentPage.on('request', (request) => {
                    request.resourceType() === 'document' ? request.continue() : request.abort();
                });

                await contentPage.goto(item.link!, { waitUntil: 'domcontentloaded' });

                const contentHtml = await contentPage.evaluate(() => document.documentElement.innerHTML);
                await contentPage.close();

                const $content = load(contentHtml);

                // Extract pubDate for featured article
                let pubDate: Date | undefined = item.pubDate;
                if (!pubDate) {
                    $content('p').each((_, el) => {
                        const text = $content(el).text().trim();
                        if (text === 'Published on') {
                            const dateText = $content(el).parent().next().find('p').first().text().trim();
                            if (dateText) {
                                pubDate = parseDate(dateText);
                            }
                            return false;
                        }
                    });
                }

                // Extract article description from paragraphs
                // The article content is in <p> tags after the h1 heading
                let description: string | undefined;

                // Find the h1 heading (article title)
                const h1 = $content('h1').first();
                if (h1.length) {
                    // Get all paragraphs that come after the h1 and are substantial (>50 chars)
                    const allParagraphs = $content('p');
                    const contentParagraphs: string[] = [];

                    allParagraphs.each((_, el) => {
                        const text = $content(el).text().trim();
                        // Skip metadata paragraphs
                        if (text === 'Written by' || text === 'Published on' || text.includes('Perplexity Team')) {
                            return;
                        }
                        // Skip very short text and links
                        if (text.length < 50) {
                            return;
                        }
                        contentParagraphs.push(text);
                        // Stop after collecting 3 good paragraphs
                        if (contentParagraphs.length >= 3) {
                            return false;
                        }
                    });

                    if (contentParagraphs.length > 0) {
                        description = contentParagraphs.join(' ');
                    }
                }

                return {
                    ...item,
                    pubDate,
                    description,
                } as DataItem;
            })) as DataItem;
        })
    );

    await destory();

    return {
        title: 'Perplexity Blog',
        link: rootUrl,
        item: resultItems,
        language: 'en',
    } satisfies Data;
}
