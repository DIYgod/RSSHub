import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';

export const route: Route = {
    path: '/yjs',
    categories: ['university'],
    example: '/scut/yjs',
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
            source: ['www2.scut.edu.cn/graduate/14562/list.htm'],
        },
    ],
    name: '研究生院通知公告',
    maintainers: ['shengmaosu'],
    handler,
    url: 'www2.scut.edu.cn/graduate/14562/list.htm',
};

async function handler() {
    const baseUrl = 'https://www2.scut.edu.cn';
    const link = `${baseUrl}/graduate/14562/list.htm`;
    const response = await got(link);
    const $ = load(response.data);
    const list = $('#wp_news_w4 a');

    const items: Array<DataItem & { link: string }> = list.toArray().flatMap((element) => {
        const $element = $(element);
        const href = $element.attr('href');
        const title = $element
            .contents()
            .filter((_, node) => node.type === 'text')
            .text();
        if (!href || !title) {
            return [];
        }
        return { title, link: new URL(href, link).href, pubDate: parseDateInTimezone($element.find('span').text(), 8) };
    });
    const item = await pMap(
        items,
        async (item) => ({
            ...item,
            ...(await cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = load(response.data);
                return { description: $('.wp_articlecontent').html() ?? undefined };
            })),
        }),
        { concurrency: 3 }
    );

    return {
        title: '华南理工大学研究生院',
        link,
        description: '华南理工大学研究生院通知公告',
        item,
    };
}
