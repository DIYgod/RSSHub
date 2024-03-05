// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const link = 'https://jwc.ouc.edu.cn/6517/list.htm';
    const response = await got(link);
    const $ = load(response.data);
    const list = $('.wp_article_list li')
        .toArray()
        .map((e) => {
            e = $(e);
            const a = e.find('a');
            return {
                title: a.attr('title'),
                link: a.attr('href'),
                pubDate: parseDate(e.find('span.Article_PublishDate').text(), 'YYYY-MM-DD'),
            };
        });

    const out = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got('https://jwc.ouc.edu.cn' + item.link);
                const $ = load(response.data);
                item.author = '中国海洋大学教务处';
                item.description = $('.wp_articlecontent').html();
                return item;
            })
        )
    );

    ctx.set('data', {
        title: '中国海洋大学教务处',
        link,
        description: '中国海洋大学教务处最新通知',
        item: out,
    });
};
