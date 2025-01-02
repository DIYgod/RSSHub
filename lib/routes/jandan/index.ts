import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import parser from '@/utils/rss-parser';

export const route: Route = {
    path: '/',
    name: 'Unknown',
    maintainers: ['nczitzk', 'bigfei'],
    handler,
};

async function handler() {
    const rootUrl = 'http://i.jandan.net';
    const feed = await parser.parseURL(`${rootUrl}/feed/`);
    const items = await Promise.all(
        feed.items.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = load(response.data);
                $('.wechat-hide').prev().nextAll().remove();
                $('img').replaceWith((i, e) => {
                    const src = $(e).attr('src');
                    const alt = $(e).attr('alt');
                    const newSrc = src?.replace(/https?:\/\/(\w+)\.moyu\.im/, 'https://$1.sinaimg.cn');
                    return `<img src="${newSrc}" alt="${alt}">`;
                });
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
    return {
        title: '煎蛋',
        link: rootUrl,
        item: items,
    };
}
