import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';

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
        .flatMap((item) => {
            const $item = $(item);
            const href = $item.find('a').attr('href');
            const title = $item.find('.f-clamp').text();
            const itemPubdate = $item.find('.mobi').text();
            return href && title ? { title, link: new URL(href, baseUrl).href, pubDate: itemPubdate ? parseDateInTimezone(itemPubdate, 8) : undefined } : [];
        });
    const items = await pMap(
        list,
        async (item) => {
            const detail = await cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const content = load(response.data);
                const body = content('.m-details-con .u-content');
                if (!body.length) {
                    throw new Error(`The news page has no public article content: ${item.link}`);
                }
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
                return { description: body.html() ?? undefined, author: credits.length ? credits.join(' ') : undefined };
            });
            return { ...item, ...detail };
        },
        { concurrency: 3 }
    );

    return { title: '南方科技大学新闻网-中文', link, item: items };
}
