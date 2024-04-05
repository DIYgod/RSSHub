import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'http://www.dyyy.xjtu.edu.cn';

export const route: Route = {
    path: '/dyyy/:path{.+}',
    name: 'Unknown',
    maintainers: [],
    handler,
};

async function handler(ctx) {
    const path = ctx.req.param('path');
    const response = await got(`${baseUrl}/${path}.htm`);

    const $ = load(response.data);

    const items = $('.list_right_con div li')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('a').attr('title'),
                link: new URL(item.find('a').attr('href'), response.url).href,
                pubDate: parseDate(item.find('.data').text()),
            };
        });

    await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);

                item.author = $('.content_source')
                    .text()
                    .match(/责任编辑：(.*)\(点击/)[1];
                item.description = $('.content_con').html();
                return item;
            })
        )
    );

    return {
        title: $('head title').text(),
        link: `${baseUrl}/${path}.htm`,
        item: items,
    };
}
