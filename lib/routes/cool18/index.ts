import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import type { Context } from 'hono';
import puppeteer from '@/utils/puppeteer';
import logger from '@/utils/logger';

export const route: Route = {
    path: '/:id/:type?/:keyword?',
    url: 'cool18.com',
    example: 'cool18.com/bbs4',
    parameters: { id: 'the name of the bbs', type: 'the type of the post. Can be `home`, `gold` or `threadsearch`. Default: `home`', keyword: 'the keyword to search.' },
    categories: ['bbs'],
    radar: [
        {
            source: ['cool18.com/:id/', 'www.cool18.com/:id/index.php?action=search&bbsdr=:id&act=:type&app=forum&keywords=:keyword&submit=%E6%9F%A5%E8%AF%A2', 'www.cool18.com/:id/index.php?app=forum&act=:type'],
            target: '/:id/:type?/:keyword?',
        },
    ],
    name: '禁忌书屋',
    maintainers: ['nczitzk', 'Gabrlie'],
    handler,
};

async function handler(ctx: Context) {
    const { id, type = 'home', keyword } = ctx.req.param();

    const rootUrl = 'https://www.cool18.com/' + id + '/';
    const params = type === 'home' ? '' : (type === 'gold' ? '?app=forum&act=gold' : `?action=search&act=threadsearch&app=forum&keywords=${keyword}&submit=查询`);

    const currentUrl = rootUrl + 'index.php' + params;

    const browser = await puppeteer();
    const page = await browser.newPage();
    await page.setRequestInterception(true);

    page.on('request', (request) => {
        ['document', 'script', 'xhr'].includes(request.resourceType()) ? request.continue() : request.abort();
    });

    logger.http(`Requesting ${currentUrl}`);
    await page.goto(currentUrl, {
        waitUntil: 'domcontentloaded',
    });

    const response = await page.content();
    await page.close();

    const $ = load(response);

    const list = $('#d_list ul li, #thread_list li, .t_l .t_subject')
        .slice(0, ctx.req.query('limit') ? Number.parseInt(<string>ctx.req.query('limit')) : 20)
        .toArray()
        .map((item) => {
            const a = $(item).find('a').first();

            return {
                title: a.text(),
                link: `${rootUrl}/${a.attr('href')}`,
                pubDate: parseDate($(item).find('i').text(), 'MM/DD/YY'),
                author: $(item).find('a').last().text(),
                category: a.find('span').first().text(),
                description: '',
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);
                const preElement = content('pre');
                if (preElement.length > 0) {
                    const htmlContent = preElement.html();
                    item.description = htmlContent ? htmlContent.replaceAll(/<font color="#E6E6DD">cool18.com<\/font>/g, '') : '';
                }
                return item;
            })
        )
    );

    await browser.close();

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
