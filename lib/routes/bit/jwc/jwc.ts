// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
const util = require('./utils');

export default async (ctx) => {
    const link = 'https://jwc.bit.edu.cn/tzgg/';
    const response = await got({
        method: 'get',
        url: link,
    });

    const $ = load(response.data);

    const list = $('li.gpTextArea').toArray();

    const result = await util.ProcessFeed(list, cache);

    ctx.set('data', {
        title: $('title').text(),
        link,
        description: '北京理工大学教务部',
        item: result,
    });
};
