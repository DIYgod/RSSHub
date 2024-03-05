// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
const util = require('./utils');

export default async (ctx) => {
    const id = ctx.req.param('id');

    const response = await got({
        method: 'get',
        url: `https://www.jianshu.com/u/${id}`,
        headers: {
            Referer: `https://www.jianshu.com/u/${id}`,
        },
    });

    const data = response.data;

    const $ = load(data);
    const list = $('.note-list li').get();

    const result = await util.ProcessFeed(list, cache);

    ctx.set('data', {
        title: $('title').text(),
        link: `https://www.jianshu.com/u/${id}`,
        description: $('meta[name="description"]').attr('content') || $('title').text(),
        item: result,
    });
};
