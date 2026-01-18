import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
import { parseDate } from '@/utils/parse-date';
import { getPuppeteerPage } from '@/utils/puppeteer';

export const handler = async (ctx: Context): Promise<Data> => {
    const limit = Number.parseInt(ctx.req.query('limit') ?? '20', 10);

    const baseUrl = 'https://www.perplexity.ai';
    const targetUrl = `${baseUrl}/changelog`;

    logger.http(`Fetching Perplexity changelog from ${targetUrl}`);

    const html = await cache.tryGet('perplexity:changelog:index', async () => {
        const { page, destory } = await getPuppeteerPage(targetUrl, {
            onBeforeLoad: async (page) => {
                await page.setRequestInterception(true);
                page.on('request', (request) => {
                    request.resourceType() === 'document' ? request.continue() : request.abort();
                });
            },
        });
        const content = await page.evaluate(() => document.documentElement.innerHTML);
        await destory();
        return content;
    });

    const $ = load(html);
    const language = $('html').attr('lang') ?? 'en';

    const items: DataItem[] = [];
    const seenLinks = new Set<string>();

    $('a[href*="./changelog/"]').each((_, elem) => {
        const $link = $(elem);
        const href = $link.attr('href');

        if (!href || !href.startsWith('./changelog/')) {
            return;
        }

        const fullLink = href.startsWith('http') ? href : `${baseUrl}${href.replace('./', '/')}`;

        if (seenLinks.has(fullLink)) {
            return;
        }

        const $title = $link.find('[data-framer-name="Title"] p').first();
        const title = $title.text().trim();

        if (!title) {
            return;
        }

        const $category = $link.find('[data-framer-name="Category"] p').first();
        const dateText = $category.text().trim();

        const $summary = $link.find('p.framer-text.framer-styles-preset-16bzrdu').first();
        const summary = $summary.text().trim();

        seenLinks.add(fullLink);

        let pubDate: Date | undefined;
        if (dateText) {
            const dateMatch = dateText.match(/(\d{2})\.(\d{2})\.(\d{2})/) || dateText.match(/(\d{4})\.(\d{2})\.(\d{2})/);
            if (dateMatch) {
                const [, year, month, day] = dateMatch;
                const fullYear = year.length === 2 ? `20${year}` : year;
                pubDate = parseDate(`${fullYear}-${month}-${day}`);
            } else {
                pubDate = parseDate(dateText);
            }
        } else if (title) {
            const dateMatch = title.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:st|nd|rd|th)?,\s*\d{4}/);
            if (dateMatch) {
                pubDate = parseDate(dateMatch[0]);
            }
        }

        items.push({
            title,
            description: summary,
            link: fullLink,
            pubDate,
            guid: `perplexity-changelog-${fullLink}`,
            id: `perplexity-changelog-${fullLink}`,
        });
    });

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
    maintainers: ['sisyphus'],
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
