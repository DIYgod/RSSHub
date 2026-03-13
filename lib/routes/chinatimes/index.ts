import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import puppeteer from '@/utils/puppeteer';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/:category?',
    categories: ['traditional-media'],
    example: '/chinatimes/realtimenews',
    parameters: { category: '分類，見下表，留空為 `realtimenews`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.chinatimes.com/:category/', 'www.chinatimes.com/'],
        },
    ],
    name: '分類',
    maintainers: ['KingJem'],
    handler,
    url: 'www.chinatimes.com/',
    description: `|     即時     |   熱門  |   政治  | 生活 | 娛樂 |  財經 |  國際 |   言論  |   兩岸  |   軍事   |   社會  |  健康  |  體育  |      科技      |   運勢  | 有影 |  寶島  |
| :----------: | :-----: | :-----: | :--: | :--: | :---: | :---: | :-----: | :-----: | :------: | :-----: | :----: | :----: | :------------: | :-----: | :--: | :----: |
| realtimenews | hotnews | politic | life | star | money | world | opinion | chinese | armament | society | health | sports | technologynews | fortune | tube | taiwan |`,
};

async function handler(ctx) {
    const baseUrl = 'https://www.chinatimes.com';

    const { category = 'realtimenews' } = ctx.req.param('category');
    const link = `${baseUrl}/${category}/?chdtv`;

    const response = await ofetch(link);
    const $ = load(response);
    const browser = await puppeteer();

    const list = $('.articlebox-compact')
        .toArray()
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20)
        .map((item) => {
            const $item = $(item);
            const a = $item.find('.title a');
            return {
                title: a.text().trim(),
                link: `${baseUrl}${a.attr('href')}?chdtv`,
                guid: `${baseUrl}${a.attr('href')}`,
                pubDate: timezone(parseDate($item.find('time').attr('datetime')), 8),
                category: $item
                    .find('.category a')
                    .toArray()
                    .map((i) => $(i).text().trim()),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const page = await browser.newPage();
                await page.setRequestInterception(true);
                page.on('request', (request) => {
                    request.resourceType() === 'document' ? request.continue() : request.abort();
                });
                logger.http(`Requesting ${item.link}`);
                await page.goto(item.link, {
                    waitUntil: 'domcontentloaded',
                });

                const response = await page.content();
                await page.close();
                const $ = load(response);

                item.category = [
                    ...new Set([
                        ...item.category,
                        ...$('.article-hash-tag a')
                            .toArray()
                            .map((i) => $(i).text().trim()),
                    ]),
                ];

                $('.ad, #donate-form-container, .promote-word, .google-news-promote, .article-hash-tag').remove();

                item.description = $('.main-figure').html() + $('.article-body').html();

                return item;
            })
        )
    );

    await browser.close();

    return {
        title: $('head title').text(),
        description: $('head meta[name="description"]').attr('content'),
        link,
        language: $('html').attr('lang'),
        image: `${baseUrl}/images/2020/apple-touch-icon.png`,
        item: items,
    };
}
