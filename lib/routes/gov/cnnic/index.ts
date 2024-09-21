import { Route } from '@/types';
import { getSubPath } from '@/utils/common-utils';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/cnnic/*',
    name: 'Unknown',
    maintainers: [],
    handler,
};

async function handler(ctx) {
    const path = getSubPath(ctx).replaceAll(/^\/cnnic/g, '');

    const rootUrl = 'http://www.cnnic.net.cn';
    const currentUrl = `${rootUrl}${path === '/' ? '/gywm/xwzx/rdxw/20172017_7086/' : `${path}/`}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.link a')
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 12)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: new URL(item.attr('href'), currentUrl).href,
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

                item.description = content('.TRS_Editor').html();
                item.pubDate = timezone(parseDate(content('.info .text span').first().text(), 'YYYY年MM月DD日 HH:mm'), +8);

                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
