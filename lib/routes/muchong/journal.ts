import { load } from 'cheerio';
import type { Context } from 'hono';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/journal/:type?',
    categories: ['bbs'],
    example: '/muchong/journal',
    parameters: { type: '类型，见下表' },
    name: '期刊点评',
    maintainers: ['nczitzk'],
    description: `| SCI 期刊 | 中文期刊 |
| -------- | -------- |
|          | cn       |`,
    handler,
};

async function handler(ctx: Context) {
    const { type = '' } = ctx.req.param();

    const rootUrl = 'http://muchong.com';
    const decoder = new TextDecoder('gbk');
    const currentUrl = `${rootUrl}/${type === '' ? 'bbs/journal' : 'journal_cn'}.php`;

    const response = await ofetch(currentUrl, { responseType: 'arrayBuffer' });
    const $ = load(decoder.decode(response));

    const list = $('.jname a, .journal_list a')
        .slice(0, 15)
        .toArray()
        .map((element): DataItem & { link: string } => {
            const $item = $(element);
            const link = $item.attr('href')!;
            return {
                title: $item.text(),
                link: link.includes('http') ? link : `${rootUrl}/bbs/${link}`,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await ofetch(item.link, { responseType: 'arrayBuffer' });
                const content = load(decoder.decode(detailResponse));

                item.description = content('.forum_explan dl table').eq(1).html();

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
