import { load } from 'cheerio';

import { config } from '@/config';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import { finishArticleItem } from '@/utils/wechat-mp';

const baseUrl = 'https://www.nmpa.gov.cn';

export const route: Route = {
    path: '/:path{.+}',
    name: '通用',
    example: '/gov/nmpa/xxgk/ggtg',
    parameters: { path: '路径，默认为公告通告' },
    radar: [
        {
            source: ['www.nmpa.gov.cn/*path/index.html', 'www.nmpa.gov.cn/*path'],
            target: '/:path',
        },
    ],
    maintainers: ['TonyRL'],
    handler,
    description: `::: tip

路径处填写对应页面 URL 中 \`https://www.nmpa.gov.cn/\` 与 \`/index.html\` 之间的字段，下面是一个例子。

若订阅 [公告通告](https://www.nmpa.gov.cn/xxgk/ggtg/index.html) 则将对应页面 URL <https://www.nmpa.gov.cn/xxgk/ggtg/index.html> 中 \`https://www.nmpa.gov.cn/\` 和 \`/index.html\` 之间的字段 \`xxgk/ggtg\` 作为路径填入。此时路由为 [\`/gov/nmpa/xxgk/ggtg\`](https://rsshub.app/gov/nmpa/xxgk/ggtg)

:::`,
};

async function handler(ctx) {
    const path = ctx.req.param('path');
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
            if (item.link.startsWith('https://www.nmpa.gov.cn/')) {
                return cache.tryGet(item.link, async () => {
                    const { data: html } = await got(item.link);
                    const $ = load(html);
                    item.description = $('.text').html();
                    item.pubDate = timezone(parseDate($('meta[name="PubDate"]').attr('content')), +8);
                    return item;
                });
            } else if (item.link.startsWith('https://mp.weixin.qq.com/')) {
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
