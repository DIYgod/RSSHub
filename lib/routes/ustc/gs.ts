import { load } from 'cheerio';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const map = new Map([
    ['tzgg', { title: '中国科学技术大学研究生院 - 通知公告', id: '9' }],
    ['xwdt', { title: '中国科学技术大学研究生院 - 新闻动态', id: '10' }],
]);
const host = 'https://gradschool.ustc.edu.cn';
export const route: Route = {
    path: '/gs/:type?',
    categories: ['university'],
    example: '/ustc/gs/tzgg',
    parameters: { type: '分类，见下表，默认为通知公告' },
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
            source: ['gradschool.ustc.edu.cn/'],
            target: '/gs',
        },
    ],
    name: '研究生院',
    maintainers: ['jasongzy'],
    handler,
    url: 'gradschool.ustc.edu.cn/',
    description: `| 通知公告 | 新闻动态 |
| -------- | -------- |
| tzgg     | xwdt     |`,
};
async function handler(ctx) {
    const type = ctx.req.param('type') ?? 'tzgg';
    const info = map.get(type);
    if (!info) {
        throw new InvalidParameterError('invalid type');
    }
    const id = info.id;
    const response = await got(`${host}/column/${id}`);
    const $ = load(response.data);
    let items = $('div.r-box > ul')
        .find('li')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            const title = $item.find('a').text();
            const link = new URL($item.find('a').attr('href')!, host).href;
            const published = $item.find('time').text().trim();
            const pubDate = published ? timezone(parseDate(published, 'YYYY-MM-DD'), 8) : undefined;
            return {
                title,
                pubDate,
                link,
            };
        });
    items = await pMap(
        items,
        async (item) => {
            const details = await cache.tryGet<Pick<DataItem, 'description' | 'pubDate' | 'author' | 'enclosure_url' | 'enclosure_type' | 'enclosure_length'>>(`ustc:gs:detail:${item.link}`, async () => {
                const details: Pick<DataItem, 'description' | 'pubDate' | 'author' | 'enclosure_url' | 'enclosure_type' | 'enclosure_length'> = {};
                try {
                    if (new URL(item.link!).pathname.endsWith('.pdf')) {
                        const response = await ofetch.raw<unknown, 'arrayBuffer'>(item.link!, { responseType: 'arrayBuffer' });
                        if (response.headers.get('content-type')?.split(';', 1)[0] === 'application/pdf') {
                            details.enclosure_url = item.link;
                            details.enclosure_type = 'application/pdf';
                            details.enclosure_length = response._data?.byteLength;
                        }
                        return details;
                    }
                    const response = await got(item.link);
                    const $detail = load(response.data);
                    details.description = $detail('article.article').html();
                    const published = $detail('.info-bar time')
                        .text()
                        .match(/\d{4}-\d{2}-\d{2}/)?.[0];
                    details.pubDate = published ? timezone(parseDate(published, 'YYYY-MM-DD'), 8) : undefined;
                } catch {
                    // Retain the existing optional-detail fallback.
                }
                return details;
            });
            return { ...item, ...details, pubDate: details.pubDate ?? item.pubDate };
        },
        { concurrency: 3 }
    );
    return {
        title: info.title,
        link: `${host}/column/${id}`,
        item: items,
    };
}
