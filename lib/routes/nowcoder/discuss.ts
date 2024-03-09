import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const host = 'https://www.nowcoder.com';

export const route: Route = {
    path: '/discuss/:type/:order',
    categories: ['bbs'],
    example: '/nowcoder/discuss/2/4',
    parameters: { type: '讨论区分区id 在 URL 中可以找到', order: '排序方式' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '讨论区',
    maintainers: ['LogicJake'],
    handler,
    description: `| 最新回复 | 最新发表 | 最新 | 精华 |
  | -------- | -------- | ---- | ---- |
  | 0        | 3        | 1    | 4    |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type');
    const order = ctx.req.param('order');

    const link = `https://www.nowcoder.com/discuss?type=${type}&order=${order}`;
    const response = await got.get(link);
    const $ = load(response.data);

    const type_name = $('a.discuss-tab.selected').text();
    const order_name = $('li.selected a').text();

    const list = $('li.clearfix')
        .map(function () {
            const info = {
                title: $(this).find('div.discuss-main.clearfix a:first').text().trim().replace('\n', ' '),
                link: $(this).find('div.discuss-main.clearfix a[rel]').attr('href'),
            };
            return info;
        })
        .get();

    const out = await Promise.all(
        list.map((info) => {
            const title = info.title || 'tzgg';
            const itemUrl = new URL(info.link, host).href.replace(/^(.*)\?(.*)$/, '$1');

            return cache.tryGet(itemUrl, async () => {
                const response = await got.get(itemUrl);
                const $ = load(response.data);

                const date_value = $('span.post-time').text();

                const description = $('.nc-post-content').html();

                return {
                    title,
                    link: itemUrl,
                    description,
                    pubDate: timezone(parseDate(date_value), +8),
                };
            });
        })
    );

    return {
        title: `${type_name}${order_name}——牛客网讨论区`,
        link,
        item: out,
    };
}
