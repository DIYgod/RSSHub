// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
const iconv = require('iconv-lite');
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const gbk2utf8 = (s) => iconv.decode(s, 'gbk');
export default async (ctx) => {
    const baseUrl = 'https://jsjxy.stbu.edu.cn/news/';
    const { data: response } = await got(baseUrl, {
        responseType: 'buffer',
        https: {
            rejectUnauthorized: false,
        },
    });
    const $ = load(gbk2utf8(response));
    const list = $('.content dl h4')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('a').first();
            return {
                title: a.text(),
                link: a.attr('href'),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link, {
                    responseType: 'buffer',
                    https: {
                        rejectUnauthorized: false,
                    },
                });
                const $ = load(gbk2utf8(response));
                item.description = $('.content14').first().html().trim();
                item.pubDate = timezone(parseDate($('.article .source').text().split('日期：')[1].replace('\n', '').trim()), +8);
                return item;
            })
        )
    );

    ctx.set('data', {
        title: '四川工商学院计算机学院 - 新闻动态',
        link: baseUrl,
        description: '四川工商学院计算机学院 - 新闻动态',
        item: items,
    });
};
