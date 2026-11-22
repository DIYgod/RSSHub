import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/time';

export const route: Route = {
    path: '/newshub-zh',
    categories: ['university'],
    example: '/sustech/newshub-zh',
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
            source: ['newshub.sustech.edu.cn/news'],
        },
    ],
    name: '新闻网（中文）',
    maintainers: ['sparkcyf'],
    handler,
    url: 'newshub.sustech.edu.cn/news',
};

async function handler() {
    const baseUrl = 'https://newshub.sustech.edu.cn';
    const link = `${baseUrl}/news`;
    const response = await got({
        method: 'get',
        url: link,
    });

    const data = response.data;

    const $ = load(data);

    const list: Array<DataItem & { link: string }> = $('.m-newslist ul li')
        .toArray()
        .map((item) => {
            const $item = $(item);
            return { title: $item.find('.f-clamp').text(), link: `${baseUrl}${$item.find('a').attr('href')}`, pubDate: parseDate($item.find('.mobi').text(), 8) };
        });
    const items = await pMap(
        list,
        async (item) => {
            const detail = await cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const content = load(response.data);
                const body = content('.m-details-con .u-content');
                const credits: string[] = [];
                for (const element of body.children().toArray().toReversed()) {
                    const text = content(element).text().trim();
                    if (!text) {
                        continue;
                    }
                    if (/^(?:供稿(?:单位)?|通讯员|主图|编辑|摄影|采写)[:：]/.test(text)) {
                        credits.unshift(text);
                        content(element).remove();
                    } else {
                        break;
                    }
                }
                return { description: body.html(), author: credits.join(' ') };
            });
            return { ...item, ...detail };
        },
        { concurrency: 3 }
    );

    return { title: '南方科技大学新闻网-中文', link, item: items };
}
