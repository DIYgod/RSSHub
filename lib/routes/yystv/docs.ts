import type { Route, Data } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseRelativeDate } from '@/utils/parse-date';
import cache from '@/utils/cache';

export const route: Route = {
    path: '/docs',
    categories: ['game'],
    example: '/yystv/docs',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['yystv.cn/docs'],
        },
    ],
    name: '游研社 - 全部文章',
    maintainers: ['HaitianLiu', 'yy4382'],
    handler,
    url: 'yystv.cn/docs',
};

async function handler() {
    const url = `https://www.yystv.cn/docs`;
    const response = await ofetch(url);

    const $ = load(response);

    const itemList = $('.list-container li')
        .slice(0, 18)
        .map(function () {
            const info = {
                title: $('.list-article-title', this).text(),
                link: 'https://www.yystv.cn' + $('a', this).attr('href'),
                pubDate: parseRelativeDate($('.c-999', this).text()),
                author: $('.handler-author-link', this).text(),
                description: $('.list-article-intro', this).text(),
            };
            return info;
        })
        .get() satisfies Data[];

    const items = (await Promise.all(
        itemList.map(
            (item) =>
                cache.tryGet(item.link, async () => {
                    const resp = await ofetch(item.link);
                    const $ = load(resp);
                    item.description = $('#main section.article-section .doc-content > div').html() || item.description;
                    return item;
                }) as Promise<Data>
        )
    )) satisfies Data[];

    return {
        title: '游研社-' + $('title').text(),
        link: `https://www.yystv.cn/docs`,
        item: items,
    };
}
