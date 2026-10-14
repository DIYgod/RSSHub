import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const pageUrl = 'https://support.bluestacks.com/hc/en-us/articles/360056960211-Release-Notes-BlueStacks-5';

interface ArticleResponse {
    article: {
        title: string;
        body: string;
        edited_at: string;
    };
}

export const route: Route = {
    path: '/release/5',
    categories: ['program-update'],
    example: '/bluestacks/release/5',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['support.bluestacks.com/hc/en-us/articles/360056960211-Release-Notes-BlueStacks-5', 'bluestacks.com/'],
        },
    ],
    name: '5 Release Notes',
    maintainers: ['TonyRL'],
    handler,
    url: 'support.bluestacks.com/hc/en-us/articles/360056960211-Release-Notes-BlueStacks-5',
};

async function handler() {
    const apiUrl = 'https://support.bluestacks.com/api/v2/help_center/en-us/articles';
    const { article } = await ofetch<ArticleResponse>(`${apiUrl}/360056960211.json`);
    const $ = load(article.body);
    const list = $('h3 a')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            return {
                title: $item.text(),
                link: new URL($item.attr('href')!, pageUrl).href,
            };
        });

    const items = await pMap(
        list,
        (item) =>
            cache.tryGet(item.link!, async () => {
                const id = new URL(item.link!).pathname.match(/\/articles\/(\d+)/)?.[1];
                if (!id) {
                    throw new Error(`Unable to find the BlueStacks release article ID: ${item.link}`);
                }
                const { article } = await ofetch<ArticleResponse>(`${apiUrl}/${id}.json`);
                item.description = article.body;
                item.pubDate = parseDate(article.edited_at);

                return item;
            }),
        { concurrency: 3 }
    );

    return {
        title: article.title,
        link: pageUrl,
        item: items,
    };
}
