import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://www.ahstu.edu.cn';

export const route: Route = {
    path: '/akyw',
    categories: ['university'],
    example: '/ahstu/akyw',
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
            source: ['ahstu.edu.cn/index/akyw.htm'],
            target: '/akyw',
        },
    ],
    name: '安科要闻',
    maintainers: ['JizzCruiy'],
    handler,
};

async function handler() {
    const listUrl = `${baseUrl}/index/akyw.htm`;
    const { data: listResponse } = await got(listUrl);
    const $ = load(listResponse);

    const list = $('a.rigthConBox-conList')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            return {
                title: $item.find('.conListWord').text().trim(),
                link: new URL($item.attr('href')!, baseUrl).href,
                pubDate: parseDate($item.find('.conListTime').text().trim()),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const { data: detailResponse } = await got(item.link);
                const $detail = load(detailResponse);

                item.author = $detail('.list-infor')
                    .text()
                    .match(/作者：([^】]+)/)?.[1]
                    ?.trim();
                item.description = $detail('.v_news_content').html();

                return item;
            })
        )
    );

    return {
        title: '安徽科技工程大学 - 安科要闻',
        link: listUrl,
        item: items,
    };
}
