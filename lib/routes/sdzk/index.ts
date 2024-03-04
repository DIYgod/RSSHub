// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const bcid = ctx.req.param('bcid') ?? '1';
    const cid = ctx.req.param('cid') ?? '16';

    const rootUrl = 'https://www.sdzk.cn';
    const currentUrl = `${rootUrl}/NewsList.aspx?BCID=${bcid}${cid ? `&CID=${cid}` : ''}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('a[title]')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: new URL(item.attr('href'), rootUrl).href,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                const info = content('div.laylist-r em').text();

                item.description = content('.txt').html();
                item.pubDate = parseDate(info.split('发布时间：').pop());

                return item;
            })
        )
    );

    ctx.set('data', {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    });
};
