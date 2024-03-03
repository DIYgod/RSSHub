// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://is.cas.cn';

export default async (ctx) => {
    const path = ctx.req.param('path');
    const response = await got(`${baseUrl}/${path}/`);

    const $ = load(response.data);
    const items = $('.list-news ul li')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('a').text(),
                link: new URL(item.find('a').attr('href'), response.url).href,
                pubDate: parseDate(item.find('span').text().replaceAll('[]', '')),
            };
        });

    await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                if (!item.link.startsWith(`${baseUrl}/`)) {
                    return item;
                }

                const response = await got(item.link);
                const $ = load(response.data);

                item.description = $('.TRS_Editor').html();
                return item;
            })
        )
    );

    ctx.set('data', {
        title: $('head title').text(),
        link: `${baseUrl}/${path}`,
        item: items,
    });
};
