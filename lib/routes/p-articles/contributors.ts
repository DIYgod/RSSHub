import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

import { ProcessFeed, rootUrl } from './utils';

export const route: Route = {
    path: '/contributors/:author',
    categories: ['reading'],
    example: '/p-articles/contributors/黃衍仁',
    parameters: { author: '虛詞作者, 可在作者页面 URL 找到' },
    name: '虛詞作者',
    maintainers: ['Insomnia1437'],
    handler,
    radar: [
        {
            source: ['p-articles.com/contributors/:author'],
        },
    ],
};

async function handler(ctx) {
    const authorName: string = ctx.req.param('author');
    const authorUrl = new URL(`/contributors/${authorName}`, rootUrl).href;
    const response = await ofetch(authorUrl);
    const $ = load(response);

    const list = $('div.contect_box_05in > a')
        .toArray()
        .map((element) => {
            const info = {
                title: $(element).find('h3').text().trim(),
                link: new URL($(element).attr('href'), rootUrl).href,
            };
            return info;
        });

    const items = await Promise.all(
        list.map((info) =>
            cache.tryGet(info.link, async () => {
                const response = await ofetch(info.link);
                // const $ = load(response);
                return ProcessFeed(info, response);
            })
        )
    );
    return {
        title: '虚词 p-articles',
        link: authorUrl,
        item: items,
        language: 'zh-cn',
    };
}
