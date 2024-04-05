import { Route } from '@/types';
import cache from '@/utils/cache';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { finishArticleItem } from '@/utils/wechat-mp';
import { config } from '@/config';
const baseUrl = 'https://www.nmpa.gov.cn';
import got from '@/utils/got';

export const route: Route = {
    path: '/nmpa/*',
    name: 'Unknown',
    maintainers: [],
    handler,
};

async function handler(ctx) {
    const path = ctx.params[0];
    const url = `${baseUrl}/${path.endsWith('/') ? path.slice(0, -1) : path}/index.html`;
    const data = await cache.tryGet(
        url,
        async () => {
            const { data: html } = await got(url);
            const $ = load(html);

            return {
                title: $('head title').text(),
                description: $('meta[name=ColumnDescription]').attr('content'),
                items: $('.list ul li')
                    .toArray()
                    .map((item) => {
                        item = $(item);
                        return {
                            title: item.find('a').text().trim(),
                            link: new URL(item.find('a').attr('href'), baseUrl).href,
                            pubDate: parseDate(item.find('span').text(), 'YYYY-MM-DD'),
                        };
                    }),
            };
        },
        config.cache.routeExpire,
        false
    );

    const items = await Promise.all(
        data.items.map((item) => {
            if (/^https:\/\/www\.nmpa\.gov\.cn\//.test(item.link)) {
                return cache.tryGet(item.link, async () => {
                    const { data: html } = await got(item.link);
                    const $ = load(html);
                    item.description = $('.text').html();
                    item.pubDate = timezone(parseDate($('meta[name="PubDate"]').attr('content')), +8);
                    return item;
                });
            } else if (/^https:\/\/mp\.weixin\.qq\.com\//.test(item.link)) {
                return finishArticleItem(item);
            } else {
                return item;
            }
        })
    );

    return {
        title: data.title,
        description: data.description,
        link: url,
        item: items,
    };
}
