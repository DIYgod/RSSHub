import { Route } from '@/types';
import { getSubPath } from '@/utils/common-utils';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import iconv from 'iconv-lite';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/nopss/*',
    name: 'Unknown',
    maintainers: [],
    handler,
};

async function handler(ctx) {
    const params = getSubPath(ctx) === '/nopss' ? '/GB/219469' : getSubPath(ctx).replace(/^\/nopss/, '');

    const rootUrl = 'http://www.nopss.gov.cn';
    const currentUrl = `${rootUrl}${params}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
        responseType: 'buffer',
    });

    const $ = load(iconv.decode(response.data, 'gbk'));

    let items = $('.p2j_list_con .clearfix li a')
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 40)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: `${rootUrl}${item.attr('href')}`,
                pubDate: timezone(parseDate(item.next().text(), '[YYYY-MM-DD HH:mm]'), +8),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                    responseType: 'buffer',
                });

                const content = load(iconv.decode(detailResponse.data, 'gbk'));

                item.description = content('.text_con').html();

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
