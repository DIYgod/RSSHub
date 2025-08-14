import { Route } from '@/types';
import { getPuppeteerPage } from '@/utils/puppeteer';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import logger from '@/utils/logger';

export const route: Route = {
    path: '/',
    name: '最新內容',
    url: 'commonhealth.com.tw',
    maintainers: ['johan456789'],
    example: '/commonhealth',
    categories: ['traditional-media'],
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
            source: ['www.commonhealth.com.tw/'],
            target: '/',
        },
    ],
    handler,
};

async function handler(ctx) {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 50;

    const rootUrl = 'https://www.commonhealth.com.tw';
    const currentUrl = rootUrl;
    const { page, browser } = await getPuppeteerPage(currentUrl, {
        onBeforeLoad: async (page) => {
            await page.setRequestInterception(true);
            page.on('request', (request) => {
                const type = request.resourceType();
                ['document', 'script', 'fetch', 'xhr'].includes(type) ? request.continue() : request.abort();
            });
            await page.setViewport({ width: 1920, height: 1080 });
        },
    });
    await page.waitForSelector('div.news-container a');
    const listHtml = await page.content();

    const $ = load(listHtml);

    logger.debug('=== DEBUG: Checking selectors ===');
    logger.debug(`'div.card-news' found: ${$('div.card-news').length}`);

    // Select each column card as an item using the exact selectors provided
    let items = $('div.card-news')
        .toArray()
        .map((item, index) => {
            const $item = $(item);
            const $imageAnchor = $item.find('a.card-pic').first();
            const image = $imageAnchor.find('img').attr('src');

            const $caption = $item.find('div.card-caption');
            const $textAnchor = $caption.find('a[href]').first();

            const href = $textAnchor.attr('href') || $imageAnchor.attr('href');
            const link = href ? new URL(href, rootUrl).href : undefined;

            const title = $textAnchor.find('div.caption_title').text().trim();
            const description = $textAnchor.find('p').first().text().trim();
            const dateText = $caption.find('div.caption_date').first().text().trim();
            const pubDate = dateText ? timezone(parseDate(dateText), +8) : undefined;

            logger.debug(`Item ${index}:`, {
                hasAnchor: $textAnchor.length > 0 || $imageAnchor.length > 0,
                href,
                title,
                description,
                dateText,
                image,
            });

            return {
                title,
                link,
                description,
                pubDate,
                media: image ? { thumbnail: { url: image } } : undefined,
            };
        })
        .filter((i) => i.title && i.link);

    logger.debug(`Final items count: ${items.length}`);
    logger.debug('Items after filter:', items);

    // Deduplicate by link and cap by limit
    const seen = new Set<string>();
    items = items.filter((i) => {
        if (!i.link) {
            return false;
        }
        if (seen.has(i.link)) {
            return false;
        }
        seen.add(i.link);
        return true;
    });
    items = items.slice(0, limit);

    await browser.close();

    return {
        title: '康健',
        link: currentUrl,
        language: 'zh-TW' as const,
        item: items,
    };
}
