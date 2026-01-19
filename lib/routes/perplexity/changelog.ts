import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import logger from '@/utils/logger';
import { parseDate } from '@/utils/parse-date';
import { getPuppeteerPage } from '@/utils/puppeteer';

export const handler = async (ctx: Context): Promise<Data> => {
    const limit = Number.parseInt(ctx.req.query('limit') ?? '20', 10);

    const baseUrl = 'https://www.perplexity.ai';
    const targetUrl = `${baseUrl}/changelog`;

    logger.http(`Fetching Perplexity changelog from ${targetUrl}`);

    const { page, destory } = await getPuppeteerPage(targetUrl, {
        onBeforeLoad: async (page) => {
            await page.setRequestInterception(true);
            page.on('request', (request) => {
                request.resourceType() === 'document' ? request.continue() : request.abort();
            });
        },
    });
    const html = await page.evaluate(() => document.documentElement.innerHTML);
    await destory();

    const $ = load(html);
    const language = $('html').attr('lang') ?? 'en';

    const seenLinks = new Set<string>();

    const items = $('a[href^="./changelog/"]')
        .toArray()
        .map((elem) => {
            const $link = $(elem);
            const href = $link.attr('href');

            if (!href || !href.startsWith('./changelog/')) {
                return null;
            }

            const fullLink = href.startsWith('http') ? href : `${baseUrl}${href.replace('./', '/')}`;

            if (seenLinks.has(fullLink)) {
                return null;
            }

            const $title = $link.find('[data-framer-name="Title"] p').first();
            const title = $title.text().trim();

            if (!title) {
                return null;
            }

            const $category = $link.find('[data-framer-name="Category"] p').first();
            const dateText = $category.text().trim();

            let $summary = $link.find('[data-framer-name="Description"] p, [data-framer-name="Summary"] p').first();
            if (!$summary.length) {
                $summary = $link.find('p.framer-text').not($title).not($category).first();
            }
            const summary = $summary.text().trim();

            seenLinks.add(fullLink);

            let pubDate: Date | undefined;
            if (dateText) {
                // Format: MM.DD.YY or MM.DD.YYYY (e.g., 12.12.24 = December 12, 2024)
                const dateMatch = dateText.match(/(\d{2})\.(\d{2})\.(\d{2,4})/);
                if (dateMatch) {
                    const [, month, day, year] = dateMatch;
                    const fullYear = year.length === 2 ? `20${year}` : year;
                    pubDate = parseDate(`${fullYear}-${month}-${day}`);
                } else {
                    pubDate = parseDate(dateText);
                }
            } else {
                const dateMatch = title.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:st|nd|rd|th)?,\s*\d{4}/);
                if (dateMatch) {
                    pubDate = parseDate(dateMatch[0]);
                }
            }

            return {
                title,
                description: summary,
                link: fullLink,
                pubDate,
                guid: `perplexity-changelog-${fullLink}`,
                id: `perplexity-changelog-${fullLink}`,
            } as DataItem;
        })
        .filter((item): item is DataItem => item !== null);

    return {
        title: $('title').text() || 'Perplexity Changelog',
        description: $('meta[name="description"], meta[property="og:description"]').first().attr('content') || 'Latest updates and changes from Perplexity',
        link: targetUrl,
        item: items.slice(0, limit),
        allowEmpty: true,
        image: $('meta[property="og:image"]').attr('content'),
        language: language as 'en',
    };
};

export const route: Route = {
    path: '/changelog',
    name: 'Changelog',
    url: 'www.perplexity.ai',
    maintainers: ['xbot'],
    handler,
    example: '/perplexity/changelog',
    description: 'Subscribe to Perplexity changelog for latest updates and releases.',
    categories: ['program-update'],
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.perplexity.ai/changelog'],
            target: '/changelog',
        },
    ],
    view: ViewType.Articles,
};
