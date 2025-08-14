import { Route } from '@/types';
import cache from '@/utils/cache';
import puppeteer from '@/utils/puppeteer';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

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
    const browser = await puppeteer();
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        const type = request.resourceType();
        ['document', 'script', 'fetch', 'xhr'].includes(type) ? request.continue() : request.abort();
    });
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(currentUrl, {
        waitUntil: 'domcontentloaded',
    });
    await page.waitForSelector('div.news-container a');
    const listHtml = await page.content();
    await page.close();

    const $ = load(listHtml);

    // Debug: Check what we have in the HTML
    // eslint-disable-next-line no-console
    console.log('=== DEBUG: Checking selectors ===');
    // eslint-disable-next-line no-console
    console.log(`'div.card-news' found:`, $('div.card-news').length);

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

            // eslint-disable-next-line no-console
            console.log(`Item ${index}:`, {
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

    // eslint-disable-next-line no-console
    console.log('Final items count:', items.length);
    // eslint-disable-next-line no-console
    console.log('Items after filter:', items);

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
                let detailHtml = '';
                const detailPage = await browser.newPage();

                try {
                    await detailPage.setRequestInterception(true);
                    detailPage.on('request', (request) => {
                        const type = request.resourceType();
                        ['document', 'script', 'fetch', 'xhr'].includes(type) ? request.continue() : request.abort();
                    });
                    await detailPage.goto(item.link!, {
                        waitUntil: 'networkidle2',
                    });

                    // Try primary selector first, fallback to alternative
                    await detailPage.waitForSelector('.article-content, .articleArea', { timeout: 15000 });
                    detailHtml = await detailPage.content();
                } catch {
                    // ignore - we'll keep the basic item info
                } finally {
                    await detailPage.close();
                }

                if (detailHtml) {
                    const content = load(detailHtml);
                    const articleHTML = content('.article-content').html() || content('.articleArea').html();
                    if (articleHTML) {
                        item.description = articleHTML;
                    }
                    const publishedTime = content('meta[property="article:published_time"]').attr('content');
                    if (publishedTime) {
                        item.pubDate = timezone(parseDate(publishedTime), +8);
                    }
                }

                return item;
            })
        )
    );

    await browser.close();

    return {
        title: '康健',
        link: currentUrl,
        item: items,
    };
}
