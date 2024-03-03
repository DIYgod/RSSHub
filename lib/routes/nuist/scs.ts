// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
const baseTitle = 'NUIST CS（南信大计软院）';
const baseUrl = 'https://scs.nuist.edu.cn';

export default async (ctx) => {
    const { category = 'xwkx' } = ctx.req.param();
    const link = `${baseUrl}/${category}/list.htm`;

    const response = await got(link);
    const $ = load(response.data);

    const list = $('.newsList ul')
        .eq(0)
        .find('li')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('a').attr('title'),
                link: new URL(item.find('a').attr('href'), baseUrl).href,
                pubDate: parseDate(item.find('.newsDate').text()),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = load(response.data);

                const authorMatch = $('.newsTitleAddDate')
                    .text()
                    .match(/发布者：(.*)发布时间/);
                item.author = authorMatch ? authorMatch[1].trim() : null;
                item.description = $('.newsContent').html();
                return item;
            })
        )
    );

    ctx.set('data', {
        title: baseTitle + '：' + $('head title').text(),
        description: $('meta[name=description]').attr('content'),
        link,
        item: items,
    });
};
