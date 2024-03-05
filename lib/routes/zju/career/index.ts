// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'http://www.career.zju.edu.cn';
const host = 'http://www.career.zju.edu.cn/jyxt/jygz/new/getContent.zf?minCount=0&maxCount=10&';

const map = new Map([
    [1, { title: '浙大就业服务平台 -- 新闻动态', id: 'lmjdid=739BEBB72A072B25E0538713470A6C41&sjlmid=undefined&lmtype=2&lx=2' }],
    [2, { title: '浙大就业服务平台 -- 活动通知', id: 'lmjdid=739BEBB72A0B2B25E0538713470A6C41&sjlmid=undefined&lmtype=2&lx=2' }],
    [3, { title: '浙大就业服务平台 -- 学院动态', id: 'lmjdid=739BEBB72A0C2B25E0538713470A6C41&sjlmid=undefined&lmtype=2&lx=2' }],
    [4, { title: '浙大就业服务平台 -- 告示通告', id: 'lmjdid=739BEBB72A252B25E0538713470A6C41&sjlmid=undefined&lmtype=2&lx=2' }],
]);

export default async (ctx) => {
    const type = Number.parseInt(ctx.req.param('type'));
    const id = map.get(type).id;
    const res = await got(`${host}${id}`);

    const $ = load(res.data);
    const list = $('.com-list li');
    const items =
        list &&
        list
            .map((index, item) => {
                item = $(item);
                const link = item.find('a').eq(0);
                return {
                    // title: item.find('a').attr('title'),
                    title: item.find('span').eq(0).attr('title'),
                    pubDate: parseDate(item.find('.news-time').text()),

                    link: link.attr('href').startsWith('http') ? link.attr('href') : `${rootUrl}/jyxt${link.attr('data-src')}xwid=${link.attr('data-xwid')}&lmtype=${link.attr('data-lmtype')}`,
                };
            })
            .get();

    ctx.set('data', {
        title: map.get(type).title,
        link: `${host}${id}`,
        item: items,
    });
};
