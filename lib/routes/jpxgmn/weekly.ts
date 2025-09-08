import { Route } from '@/types';
import { getOriginUrl, getArticleDesc } from './utils';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/weekly',
    categories: ['picture'],
    example: '/jpxgmn/weekly',
    radar: [
        {
            source: ['mei5.vip/'],
            target: '/weekly',
        },
    ],
    name: '本周热门',
    maintainers: ['Urabartin'],
    handler,
};

async function handler() {
    const response = await ofetch.raw(await getOriginUrl());
    const baseUrl = new URL(response.url).origin;
    const $ = load(response._data);
    const items = $('aside div:nth-child(2) li')
        .toArray()
        .map((item) => {
            const fullTitle = $(item).find('a').attr('title') || '';
            const result = fullTitle.match(/([^.]+)\.\D+([\d-]+)/);
            const ret = {
                title: fullTitle,
                link: new URL($(item).find('a').attr('href'), baseUrl).href,
            };
            if (result !== null) {
                ret.title = result[1];
                ret.pubDate = parseDate(result[2]);
            }
            return ret;
        });
    return {
        title: `极品性感美女 - 本周热门推荐`,
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
