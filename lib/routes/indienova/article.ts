// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
const { parseList, parseItem } = require('./utils');

export default async (ctx) => {
    const type = ctx.req.param('type');
    let link = 'https://indienova.com/indie-game-news/';
    if (type === 'development') {
        link = 'https://indienova.com/indie-game-development/';
    }
    const response = await got(link);

    const $ = load(response.data);
    const list = parseList($);

    const items = await Promise.all(list.map((item) => cache.tryGet(item.link, () => parseItem(item))));

    ctx.set('data', {
        title: $('head title').text(),
        link,
        description: '独立游戏资讯 | indienova 独立游戏',
        item: items,
    });
};
