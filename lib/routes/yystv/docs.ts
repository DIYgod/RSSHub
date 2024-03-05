// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseRelativeDate } from '@/utils/parse-date';

export default async (ctx) => {
    const url = `https://www.yystv.cn/docs`;
    const response = await got({
        method: 'get',
        url,
    });

    const data = response.data;
    const $ = load(data);

    const items = $('.list-container li')
        .slice(0, 18)
        .map(function () {
            const info = {
                title: $('.list-article-title', this).text(),
                link: 'https://www.yystv.cn' + $('a', this).attr('href'),
                pubDate: parseRelativeDate($('.c-999', this).text()),
                author: $('.handler-author-link', this).text(),
                description: $('.list-article-intro', this).text(),
            };
            return info;
        })
        .get();

    ctx.set('data', {
        title: '游研社-' + $('title').text(),
        link: `https://www.yystv.cn/docs`,
        item: items,
    });
};
