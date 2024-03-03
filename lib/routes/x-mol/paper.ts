// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
const utils = require('./utils');
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
const asyncPool = require('tiny-async-pool');

export default async (ctx) => {
    const { type, magazine } = ctx.req.param();
    const path = `paper/${type}/${magazine}`;
    const link = new URL(path, utils.host).href;
    const response = await got(link, {
        headers: {
            Cookie: 'journalIndexViewType=grid',
        },
    });
    const data = response.data;
    const $ = load(data);

    const newsItem = $('.magazine-model-content-new li')
        .toArray()
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20)
        .map((item) => {
            item = $(item);
            return {
                title: item.find('.magazine-text-title a').text().trim(),
                link: new URL(item.find('.magazine-model-btn a').first().attr('href'), utils.host).href,
                pubDate: timezone(
                    parseDate(
                        item
                            .find('.magazine-text-atten')
                            .text()
                            .match(/\d{4}-\d{2}-\d{2}/)[0],
                        8
                    )
                ),
            };
        });

    const asyncPoolAll = async (...args) => {
        const results = [];
        for await (const result of asyncPool(...args)) {
            results.push(result);
        }
        return results;
    };

    const item = await asyncPoolAll(2, newsItem, (element) =>
        cache.tryGet(element.link, async () => {
            const response = await got(element.link);
            const $ = load(response.data);

            const description = $('.maga-content');
            element.doi = description.find('.itsmblue').eq(1).text().trim();

            description.find('.itgaryfirst').remove();
            description.find('span').eq(0).remove();
            element.author = description.find('span').eq(0).text().trim();
            description.find('span').eq(0).remove();

            element.description = description.html();

            return element;
        })
    );

    ctx.set('data', {
        title: $('title').text(),
        link: response.url,
        description: $('meta[name="description"]').attr('content'),
        item,
    });
};
