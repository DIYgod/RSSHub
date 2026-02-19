import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseRelativeDate } from '@/utils/parse-date';

import { fetchDataItemCached } from './fetcher';

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
        .toArray()
        .map((item) => {
            const itemElement = $(item);
            const info = {
                title: itemElement.find('.list-article-title').text(),
                link: 'https://www.yystv.cn' + itemElement.find('a').attr('href'),
                pubDate: parseRelativeDate(itemElement.find('.c-999').text()),
                author: itemElement.find('.handler-author-link').text(),
                description: itemElement.find('.list-article-intro').text(),
            };
            return info;
        }) satisfies DataItem[];

    const items = (await Promise.all(
        itemList.map((item) =>
            fetchDataItemCached(item.link, (articleContent) => {
                const $ = load(articleContent);
                item.description = $('#main section.article-section .doc-content > div').html() || item.description;
                return item;
            })
        )
    )) satisfies DataItem[];

    return {
        title: '游研社-' + $('title').text(),
        link: `https://www.yystv.cn/docs`,
        item: items,
    };
}
