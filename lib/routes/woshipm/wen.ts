import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseRelativeDate } from '@/utils/parse-date';

const baseUrl = 'https://wen.woshipm.com';

function parseQuestionDate(value?: string) {
    if (!value?.trim()) {
        return;
    }
    const date = parseRelativeDate(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
}

export const route: Route = {
    path: '/wen',
    categories: ['new-media'],
    example: '/woshipm/wen',
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
            source: ['wen.woshipm.com/'],
        },
    ],
    name: '天天问',
    maintainers: ['WenryXu'],
    handler,
    url: 'wen.woshipm.com/',
};

async function handler() {
    const response = await got(`${baseUrl}/m/main/indexNewData.html`);
    const $ = load(response.data);
    const postList = $('.article-list-item')
        .toArray()
        .map((item): DataItem & { link: string } => {
            const $item = $(item);
            return {
                title: $item.find('.went-head-text').text(),
                link: `${baseUrl}${$item.find('.went-head').attr('href')}`,
                pubDate: parseQuestionDate($item.find('.list-text').text().split('|', 2)[1]),
            };
        });

    const result = await pMap(
        postList,
        async (item) => ({
            ...item,
            ...(await cache.tryGet(item.link, async () => {
                const temp = await got(item.link);
                const $ = load(temp.data);
                const category = $('.wt-bucong .flag-show .item')
                    .toArray()
                    .map((tag) => $(tag).text().trim())
                    .filter(Boolean);
                return { description: $('.wt-desc').html(), author: $('.people-info-a h3').text().trim() || undefined, category: category.length ? category : undefined };
            })),
        }),
        { concurrency: 3 }
    );

    return {
        title: '天天问 - 人人都是产品经理',
        link: baseUrl,
        item: result,
    };
}
