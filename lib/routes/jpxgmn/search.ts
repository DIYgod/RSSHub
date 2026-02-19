import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { getArticleDesc, getOriginUrl } from './utils';

export const route: Route = {
    path: '/search/:kw',
    categories: ['picture'],
    example: '/jpxgmn/search/candy',
    parameters: { kw: '搜索关键词' },
    name: '搜索',
    maintainers: ['Urabartin'],
    handler,
    features: {
        nsfw: true,
    },
};

async function handler(ctx) {
    const { kw } = ctx.req.param();
    const searchUrl = (await getOriginUrl()) + `/plus/search/index.asp?keyword=${kw}`;
    const response = await ofetch.raw(searchUrl);
    const baseUrl = new URL(response.url).origin;
    const $ = load(response._data);
    const items = $('div.list div.list div.node p')
        .toArray()
        .map((item) => ({
            title: $(item).find('b').text(),
            link: new URL($(item).find('a').attr('href'), baseUrl).href,
            pubDate: parseDate($(item).next().next().next().find('span').first().text()),
        }))
        .filter((item) => item.title.length !== 0);

    return {
        title: `极品性感美女搜索 - ${kw}`,
        link: response.url,
        item: await Promise.all(
            items.map((item) =>
                cache.tryGet(item.link, async () => {
                    item.description = await getArticleDesc(item.link);
                    return item;
                })
            )
        ),
    };
}
