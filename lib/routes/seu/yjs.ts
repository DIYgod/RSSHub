// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';

const url = 'https://seugs.seu.edu.cn/26671/list.htm';

export default async (ctx) => {
    const response = await got(url);
    const $ = load(response.data);
    const list = $('.news')
        .toArray()
        .map((element) => {
            const info = {
                title: $(element).find('span.news_title > a').attr('title'),
                link: `https://seugs.seu.edu.cn${$(element).find('span.news_title > a').attr('href')}`,
                date: $(element).find('span.news_meta').text(),
            };
            return info;
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = load(response.data);
                item.description = $('.wp_articlecontent').html();
                item.pubDate = new Date(item.date).toUTCString();
                return item;
            })
        )
    );

    ctx.set('data', {
        title: '东南大学研究生公告',
        link: url,
        item: items,
    });
};
