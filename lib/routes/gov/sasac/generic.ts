import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/:path{.+}',
    name: '通用',
    example: '/gov/sasac/n2588030/n16436141',
    parameters: { path: '路径，可在 URL 找到' },
    radar: [
        {
            source: ['www.sasac.gov.cn/*path/index.html'],
            target: '/:path',
        },
    ],
    maintainers: ['TonyRL'],
    handler,
    description: `::: tip

路径处填写对应页面 URL 中 \`http://www.sasac.gov.cn/\` 与 \`/index.html\` 之间的字段，下面是一个例子。

若订阅 [其他](http://www.sasac.gov.cn/n2588030/n16436141/index.html) 则将对应页面 URL <http://www.sasac.gov.cn/n2588030/n16436141/index.html> 中 \`http://www.sasac.gov.cn/\` 和 \`/index.html\` 之间的字段 \`n2588030/n16436141\` 作为路径填入。此时路由为 [\`/gov/sasac/n2588030/n16436141\`](https://rsshub.app/gov/sasac/n2588030/n16436141)

:::`,
};

async function handler(ctx) {
    const path = ctx.req.param('path');
    const baseUrl = 'http://www.sasac.gov.cn';
    const url = `${baseUrl}/${path}/index.html`;
    const response = await got(url);

    const $ = load(response.data);
    const list = $('.zsy_conlist li')
        .toArray()
        .filter((item) => !$(item).attr('style'))
        .map((item): DataItem => {
            const $item = $(item);
            const dateText = $item.find('span').text().replace('[', '').replace(']', '');
            return {
                title: $item.find('a').attr('title')!,
                link: new URL($item.find('a').attr('href')!, url).href,
                pubDate: dateText ? timezone(parseDate(dateText), 8) : undefined,
            };
        });

    const items = await pMap(
        list,
        (item) =>
            cache.tryGet(item.link!, async () => {
                const response = await got(item.link);
                const $ = load(response.data);
                $('style, #qr_container, #div_div, [class^=jiathis]').remove();
                item.description = $('.zsy_comain').html();
                return item;
            }),
        { concurrency: 3 }
    );

    return {
        title: $('head title').text().trim(),
        link: url,
        image: 'http://www.sasac.gov.cn/dbsource/11869722/11869731.jpg',
        item: items,
    };
}
