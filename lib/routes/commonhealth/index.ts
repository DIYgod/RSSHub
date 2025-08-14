import { Route } from '@/types';
import cache from '@/utils/cache';
import puppeteer from '@/utils/puppeteer';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/',
    name: '分類',
    url: 'commonhealth.com.tw',
    maintainers: ['johan456789'],
    example: '/commonhealth',
    categories: ['traditional-media'],
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: true,
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
    const browser = await puppeteer();
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        const type = request.resourceType();
        ['document', 'script', 'fetch', 'xhr'].includes(type) ? request.continue() : request.abort();
    });
    await page.goto(currentUrl, {
        waitUntil: 'domcontentloaded',
    });
    await page.waitForSelector('div.news-container');
    await page.waitForSelector('div.news-container a', { timeout: 15000 });
    const listHtml = await page.content();
    await page.close();

    const $ = load(listHtml);

    // Prefer specific caption blocks; fallback to generic links if needed
    let items = $('div.news-container div.card-caption')
        .toArray()
        .map((caption) => {
            const $caption = $(caption);
            const a = $caption.find('a[href]').first();
            const href = a.attr('href');
            const link = href ? new URL(href, rootUrl).href : undefined;

            const title = $caption.find('div.caption_title').text().trim() || $caption.find('h3').text().trim() || a.text().trim();
            const description = $caption.find('p').text().trim();
            const dateText = $caption.find('div.caption_date').text().trim() || $caption.closest('div.col').find('div.caption_date').first().text().trim();
            const pubDate = dateText ? timezone(parseDate(dateText), +8) : undefined;

            return { title, link, description, pubDate };
        })
        .filter((i) => i.title && i.link);

    if (items.length === 0) {
        items = $('div.news-container a[href]')
            .toArray()
            .map((anchor) => {
                const $a = $(anchor);
                const href = $a.attr('href');
                const link = href ? new URL(href, rootUrl).href : undefined;
                const title = $a.text().trim();
                return { title, link, description: '', pubDate: undefined } as {
                    title: string;
                    link: string | undefined;
                    description: string;
                    pubDate: Date | undefined;
                };
            })
            .filter((i) => i.title && i.link);
    }

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

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link!, async () => {
                const detailPage = await browser.newPage();
                await detailPage.setRequestInterception(true);
                detailPage.on('request', (request) => {
                    const type = request.resourceType();
                    ['document', 'script', 'fetch', 'xhr'].includes(type) ? request.continue() : request.abort();
                });
                await detailPage.goto(item.link!, {
                    waitUntil: 'domcontentloaded',
                });
                await detailPage.waitForSelector('.article-content');
                const detailHtml = await detailPage.content();
                await detailPage.close();

                const content = load(detailHtml);

                const articleContent = content('.article-content').html();
                if (articleContent) {
                    item.description = articleContent;
                }
                const publishedTime = content('meta[property="article:published_time"]').attr('content');
                if (publishedTime) {
                    item.pubDate = timezone(parseDate(publishedTime), +8);
                }

                return item;
            })
        )
    );

    await browser.close();

    return {
        title: `康健 - ${$('h1.title').text()}`,
        link: currentUrl,
        item: items,
    };
}
