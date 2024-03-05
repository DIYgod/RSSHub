// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
const utils = require('./utils');
// import { load } from 'cheerio';

export default async (ctx) => {
    const url = 'https://www.leiphone.com/site/YejieKuaixun';
    const res = await got.get(url);
    const article = (res.data || {}).article || [];

    const list = article.map((item) => item.url);
    const items = await utils.ProcessFeed(list, cache);

    ctx.set('data', {
        title: '雷峰网 业界资讯',
        description: '雷峰网 - 读懂智能&未来',
        link: url,
        item: items,
    });
};
