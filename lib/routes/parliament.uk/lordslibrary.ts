import { load } from 'cheerio';
import { Route } from '@/types';
import puppeteer from '@/utils/puppeteer';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/lordslibrary/type/:topic?',
    categories: ['government'],
    example: '/parliament.uk/lordslibrary/type/research-briefing',
    parameters: { topic: 'research by topic, string, example: [research-briefing|buisness|economy]' },
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'House of Lords Library',
    maintainers: ['AntiKnot'],
    handler,
};

async function handler(ctx) {
    const { topic } = ctx.req.param();
    const baseUrl = 'https://lordslibrary.parliament.uk';
    const url = `${baseUrl}/type/${topic}/`;
    const browser = await puppeteer();
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        request.resourceType() === 'document' ? request.continue() : request.abort();
    });
    await page.goto(url, {
        waitUntil: 'domcontentloaded',
    });

    const html = await page.evaluate(() => document.documentElement.innerHTML);
    await page.close();
    const $ = load(html);
    const items = $('div.l-box.l-box--no-border.card__text')
        .toArray()
        .map((article) => ({
            title: $(article).find('.card__text a').text().trim(),
            link: $(article).find('.card__text a').attr('href'),
            description: $(article).find('p').last().text().trim(),
            pubDate: timezone($(article).find('.card__date time').attr('datetime')),
        }));
    browser.close();
    return {
        title: `parliament - lordslibrary - ${topic}`,
        link: url,
        item: items,
    };
}
