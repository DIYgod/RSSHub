// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import parser from '@/utils/rss-parser';

export default async (ctx) => {
    const rootUrl = 'http://i.jandan.net';
    const feed = await parser.parseURL(`${rootUrl}/feed/`);
    const items = await Promise.all(
        feed.items.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = load(response.data);
                $('.wechat-hide').prev().nextAll().remove();
                const single = {
                    title: item.title,
                    description: $('.entry').html(),
                    pubDate: item.pubDate,
                    link: item.link,
                    author: item['dc:creator'],
                    category: item.categories,
                };
                return single;
            })
        )
    );
    ctx.set('data', {
        title: '煎蛋',
        link: rootUrl,
        item: items,
    });
};
