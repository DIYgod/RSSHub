// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const id = ctx.req.param('id') ?? '3';

    const rootUrl = 'https://www.nbd.com.cn';
    const currentUrl = `${rootUrl}/columns/${id}/`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const list = $('.u-news-title a')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: item.attr('href'),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                if (!detailResponse.url.startsWith(`${rootUrl}/`)) {
                    return item;
                }
                const content = load(detailResponse.data);

                item.description = content('.g-articl-text').html();
                item.pubDate = timezone(parseDate(detailResponse.data.match(/"pubDate": "(.*)"/)[1]), +8);

                return item;
            })
        )
    );

    ctx.set('data', {
        title: `${$('h1').text() || $('.u-channelname').text()} - 每经网`,
        link: currentUrl,
        item: items,
    });
};
