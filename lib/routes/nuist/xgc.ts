import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';

import got, { parseCampusDate } from './utils';

const baseTitle = '南信大学生工作处';
const baseUrl = 'https://xgc.nuist.edu.cn';

export const route: Route = {
    path: '/xgc',
    categories: ['university'],
    example: '/nuist/xgc',
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
            source: ['xgc.nuist.edu.cn/', 'xgc.nuist.edu.cn/419/list.htm'],
        },
    ],
    name: '南信大学生工作处',
    maintainers: ['gylidian'],
    handler,
    url: 'xgc.nuist.edu.cn/',
};

async function handler() {
    const link = baseUrl + '/419/list.htm';

    const response = await got(link);
    const $ = load(response.data);
    const list = $('.wp_article_list .list_item')
        .toArray()
        .map((item): DataItem & { link: string } => {
            const $item = $(item);
            return {
                title: $item.find('a').attr('title')!,
                link: new URL($item.find('a').attr('href')!, baseUrl).href,
                pubDate: parseCampusDate($item.find('.Article_PublishDate').text()),
            };
        });

    const items = await pMap(
        list,
        async (item) => ({
            ...item,
            ...(await cache.tryGet(item.link + ':content', async () => {
                try {
                    const response = await got(item.link);
                    const $ = load(response.data);
                    return { author: $('.arti_metas .arti_publisher').text().replace('作者：', ''), description: $('.entry').html() };
                } catch {
                    // Intranet articles retain the public list metadata.
                    return {};
                }
            })),
        }),
        { concurrency: 3 }
    );

    return {
        title: baseTitle,
        link,
        item: items.filter(Boolean),
    };
}
