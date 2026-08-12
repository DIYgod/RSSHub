import { load } from 'cheerio';
import type { Context } from 'hono';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/byt/:time?',
    categories: ['new-media'],
    example: '/banyuetan/byt',
    parameters: { time: '时间，见下表，默认为每周' },
    name: '时事大事库',
    maintainers: ['nczitzk'],
    description: `| 每周          | 每月  |
| ------------- | ----- |
| shishidashiku | yiyue |`,
    handler,
};

async function handler(ctx: Context) {
    const { time = 'shishidashiku' } = ctx.req.param();

    const rootUrl = 'http://www.banyuetan.org';
    const currentUrl = `${rootUrl}/byt/${time}/index.html`;
    const response = await ofetch(currentUrl);

    const $ = load(response);

    const list = $('.byt_mian_image_list_con ul li a')
        .slice(0, 10)
        .toArray()
        .map((item) => {
            const $item = $(item);
            return {
                link: new URL($item.attr('href')!, rootUrl).href,
                title: $item.attr('title'),
            };
        }) as Array<DataItem & { link: string }>;

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await ofetch(item.link);
                const content = load(detailResponse);

                return {
                    ...item,
                    description: content('#detail_content').html(),
                    author: content('.detail_tit_source').text().replace('来源：', ''),
                    pubDate: timezone(parseDate(content('meta[property="og:release_date"]').attr('content')!), 8),
                };
            })
        )
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
