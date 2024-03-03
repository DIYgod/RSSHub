// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
const util = require('./utils');

export default async (ctx) => {
    const link = 'https://cs.bit.edu.cn/tzgg/';
    const response = await got({
        method: 'get',
        url: link,
    });

    const $ = load(response.data);

    const list = $('.box_list01 li').toArray();

    const result = await util.ProcessFeed(list, cache);

    ctx.set('data', {
        title: $('title').text(),
        link,
        description: $('meta[name="description"]').attr('content'),
        item: result,
    });
};
