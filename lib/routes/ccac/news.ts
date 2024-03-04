// @ts-nocheck
import cache from '@/utils/cache';
const utils = require('./utils');
import { parseDate } from '@/utils/parse-date';
import got from '@/utils/got';
import { load } from 'cheerio';
import puppeteer from '@/utils/puppeteer';

export default async (ctx) => {
    const browser = await puppeteer();
    const lang = ctx.req.param('lang') ?? 'sc';
    const type = utils.TYPE[ctx.req.param('type')];

    const BASE = utils.langBase(lang);
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        request.resourceType() === 'document' || request.resourceType() === 'script' ? request.continue() : request.abort();
    });
    await page.goto(BASE, {
        waitUntil: 'domcontentloaded',
    });
    const articles = await page.evaluate(() => window.articles);
    await browser.close();

    const list = utils
        .typeFilter(articles, type)
        .slice(0, ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 30)
        .map((item) => ({
            title: item.name,
            category: item.tags.map((tag) => tag.name),
            link: utils.BASE_URL + item.url,
            pubDate: parseDate(item.time, 'YYYY-MM-DD'),
        }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const $ = load(detailResponse.data);
                $('.article_details_body > *').removeAttr('style');
                item.description = $('.article_details_body').html();
                return item;
            })
        )
    );

    ctx.set('data', {
        title: `CCAC ${type}`,
        link: BASE,
        description: `CCAC ${type}`,
        language: ctx.req.param('lang') ? utils.LANG_TYPE[ctx.req.param('lang')] : utils.LANG_TYPE.sc,
        item: items,
    });
};
