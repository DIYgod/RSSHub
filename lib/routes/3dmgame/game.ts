// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
const { parseArticle } = require('./utils');

export default async (ctx) => {
    const { name, type = 'news' } = ctx.req.param();
    const url = `https://www.3dmgame.com/games/${name}/${type}/`;

    const { data: response } = await got(url);
    const $ = load(response);
    const listSelector = type === 'resource' ? $('.ZQ_Left .Llis_4 .lis li, .zq_left .rigtbox7 li').toArray() : $('.ZQ_Left .lis, .zq_left .newsleft li').toArray();

    const list = listSelector.map((i) => {
        i = $(i);
        const a = i.find('a[href]').last();
        const time = i.find('.time');
        return {
            title: a.text(),
            description: i.find('.miaoshu').text(),
            link: a.attr('href'),
            pubDate: time.length ? parseDate(time.text().trim()) : null, // 2020-12-31
        };
    });

    const items = await Promise.all(list.map((item) => parseArticle(item, cache.tryGet)));

    ctx.set('data', {
        title: $('head title').text().split('_')[0],
        description: $('head meta[name="Description"]').attr('content'),
        link: url,
        item: items,
    });
};
