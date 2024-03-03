// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const host = 'https://radio.seu.edu.cn';
    const link = new URL('_s29/15986/list.psp', host).href;
    const response = await got(link);

    const $ = load(response.data);

    const list = $('.list_item')
        .toArray()
        .map((e) => {
            e = $(e);
            const a = e.find('.Article_Title a');
            return {
                title: a.attr('title'),
                link: new URL(a.attr('href'), host).href,
                pubDate: parseDate(e.find('.Article_PublishDate').text()),
            };
        });

    const out = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = load(response.data);

                item.author = $('.arti_publisher').text().replace('发布者：', '');
                item.description = $('.wp_articlecontent').html();

                return item;
            })
        )
    );

    ctx.set('data', {
        title: '东南大学信息科学与工程学院 -- 学术活动',
        link,
        item: out,
    });
};
