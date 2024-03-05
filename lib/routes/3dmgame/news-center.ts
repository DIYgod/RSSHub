// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
const { parseArticle } = require('./utils');

export default async (ctx) => {
    const { category = '' } = ctx.req.param();
    const isArcPost = category && !isNaN(category); // https://www.3dmgame.com/news/\d+/
    const url = `https://www.3dmgame.com/${category && category !== 'news_36_1' ? 'news/' : ''}${category ?? 'news'}/`;
    const res = await got(url);
    const $ = load(res.data);
    const list = $(isArcPost ? '.selectarcpost' : '.selectpost')
        .toArray()
        .map((item) => {
            item = $(item);
            if (isArcPost) {
                return {
                    title: item.find('.bt').text(),
                    link: item.attr('href'),
                    description: item.find('p').text(),
                    pubDate: timezone(parseDate(item.find('.time').text().trim()), 8),
                };
            }
            const a = item.find('.text a');
            return {
                title: a.text(),
                link: a.attr('href'),
                description: item.find('.miaoshu').text(),
                pubDate: timezone(parseDate(item.find('.time').text().trim()), 8),
            };
        });

    const out = await Promise.all(list.map((item) => parseArticle(item, cache.tryGet)));

    ctx.set('data', {
        title: '3DM - ' + $('title').text().split('_')[0],
        description: $('meta[name="Description"]').attr('content'),
        link: url,
        item: out,
    });
};
