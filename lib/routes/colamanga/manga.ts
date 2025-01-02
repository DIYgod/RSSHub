import { Route } from '@/types';
import puppeteer from '@/utils/puppeteer';

import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import { Context } from 'hono';
import logger from '@/utils/logger';

const domain = 'www.colamanga.com';

export const route: Route = {
    path: '/:id',
    parameters: { id: '漫画id' },
    name: 'Manga',
    maintainers: ['machsix'],
    example: '/colamanga/manga-qq978758',
    categories: ['anime'],
    radar: [
        {
            source: [`${domain}/:id/`],
            target: '/:id',
        },
    ],
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    handler,
};

function shift_date(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

async function handler(ctx: Context) {
    const id = ctx.req.param('id');
    const url = `https://${domain}/${id}`;

    const browser = await puppeteer();

    const page = await browser.newPage();

    await page.setRequestInterception(true);

    page.on('request', (request) => {
        request.resourceType() === 'document' ? request.continue() : request.abort();
    });

    logger.http(`Requesting ${url}`);
    await page.goto(url, {
        // 指定页面等待载入的时间
        waitUntil: 'domcontentloaded',
    });

    const response = await page.content();
    browser.close();

    const $ = load(response);

    const book_name = $("meta[property='og:comic:book_name']").attr('content');
    const updateDateAttr = $("meta[property='og:comic:update_time']").attr('content');
    const updateDate = updateDateAttr ? timezone(parseDate(updateDateAttr)) : timezone(new Date());

    const author = $("span:contains('作者')").parent().contents().eq(1).text();
    // const cover = $(".fed-deta-images a").attr('data-original');
    const items = $('.all_data_list >ul>li>a')
        .map((i, elem) => ({
            title: `${book_name} ${$(elem).text()}`,
            link: elem.attribs.href,
            description: $('.fed-part-esan').text(),
            author,
            pubDate: shift_date(updateDate, -7 * i),
        }))
        .get();

    return {
        title: book_name || 'Unknown Manga',
        link: url,
        item: items,
    };
}
