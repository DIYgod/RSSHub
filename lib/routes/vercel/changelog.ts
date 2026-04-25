import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import { getPuppeteerPage } from '@/utils/puppeteer';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/changelog',
    categories: ['programming'],
    example: '/vercel/changelog',
    parameters: {},
    features: {
        requirePuppeteer: true,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['vercel.com/changelog', 'vercel.com'],
        },
    ],
    name: 'Changelog',
    maintainers: ['DIYgod'],
    handler,
    url: 'vercel.com/changelog',
};

async function handler() {
    const baseUrl = 'https://vercel.com';
    const changelogUrl = `${baseUrl}/changelog`;
    const limit = 10;

    const { page, destroy } = await getPuppeteerPage(changelogUrl, {
        gotoConfig: {
            waitUntil: 'networkidle2',
        },
    });

    try {
        await page.waitForSelector('a[href^="/changelog/"]', { timeout: 10000 });

        const html = await page.content();
        const $ = load(html);

        const items: DataItem[] = [];
        const seenLinks = new Set<string>();

        $('a').each((_, element) => {
            const $element = $(element);
            const href = $element.attr('href');

            if (!href || !href.startsWith('/changelog/') || href === '/changelog' || href === '/changelog/') {
                return;
            }

            if (seenLinks.has(href)) {
                return;
            }
            seenLinks.add(href);

            const $parent = $element.closest('li, article, div[role="listitem"]');

            let title = $element.text().trim();
            if (!title) {
                title = $parent.find('h1, h2, h3, h4').first().text().trim();
            }
            if (!title) {
                title = $parent.find('a').first().text().trim();
            }

            const link = `${baseUrl}${href}`;

            const datePattern = /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},\s+\d{4}/i;
            const pageText = $parent.text() || $('body').text();
            const dateMatch = pageText.match(datePattern);
            const pubDate = dateMatch ? parseDate(dateMatch[0]) : undefined;

            if (title && items.length < limit) {
                items.push({
                    title,
                    link,
                    pubDate,
                });
            }
        });

        const uniqueItems = items.slice(0, limit);

        const enrichedItems = await pMap(
            uniqueItems,
            (item) =>
                cache.tryGet(item.link!, async () => {
                    const { page: detailPage, destroy: destroyDetail } = await getPuppeteerPage(item.link!, {
                        gotoConfig: {
                            waitUntil: 'domcontentloaded',
                        },
                    });

                    try {
                        await detailPage.waitForSelector('h1, [role="main"]', { timeout: 10000 });

                        const detailHtml = await detailPage.content();
                        const $detail = load(detailHtml);

                        const $main = $detail('[role="main"], main, article').first();
                        if ($main.length > 0) {
                            $main.find('nav, header, footer, aside, [role="navigation"], [role="banner"], [role="contentinfo"]').remove();

                            $main.find('script, style, noscript').remove();

                            const htmlContent = $main.html();
                            if (htmlContent && htmlContent.trim()) {
                                item.description = htmlContent.trim();
                            }
                        }

                        if (!item.pubDate) {
                            const datePattern = /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},\s+\d{4}/i;
                            const pageText = $detail.text();
                            const dateMatch = pageText.match(datePattern);
                            if (dateMatch) {
                                item.pubDate = parseDate(dateMatch[0]);
                            }
                        }

                        return item;
                    } finally {
                        await destroyDetail();
                    }
                }),
            { concurrency: 5 }
        );

        return {
            title: 'Vercel Changelog',
            link: changelogUrl,
            description: 'Latest updates from Vercel Changelog',
            item: enrichedItems,
        };
    } finally {
        await destroy();
    }
}
