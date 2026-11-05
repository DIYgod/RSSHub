import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

import { getNotices, getPreviewUrl, type Notice } from './utils';

const baseUrl = 'https://e.ecust.edu.cn';

const getPublicationDate = (item: Notice) => {
    const value = item.publishTime || item['6']?.value;
    if (!value) {
        return;
    }
    const date = timezone(parseDate(value), 8);
    return Number.isFinite(date.getTime()) ? date : undefined;
};

export const route: Route = {
    path: '/jxjy/news',
    categories: ['university'],
    example: '/ecust/jxjy/news',
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
            source: ['e.ecust.edu.cn/engine2/m/38F638B77773ADD3', 'e.ecust.edu.cn/'],
        },
    ],
    name: '继续教育学院 - 学院公告',
    maintainers: ['jialinghui'],
    handler,
    url: 'e.ecust.edu.cn',
};

async function handler(ctx) {
    const homepage = await ofetch<string>(baseUrl);
    const previewUrl = await getPreviewUrl(homepage, baseUrl);
    const response = await ofetch<string>(previewUrl);
    const { list, engineInstanceId } = await getNotices(response);
    const candidates = list.map((item) => ({
        item: {
            title: item.title || item['1'].value,
            link: item.url ? new URL(item.url, baseUrl).href : `${baseUrl}/engine2/d/${item.id}/${engineInstanceId}/0`,
            pubDate: getPublicationDate(item),
            author: item.author || undefined,
        } satisfies DataItem,
        detailUrl: new URL(item.dataUrl, baseUrl).href,
    }));
    const preserveSourceOrder = ctx.req.query('sorted') === 'false';
    const datesComplete = candidates.every(({ item }) => Number.isFinite(item.pubDate?.getTime()));
    if (!preserveSourceOrder && datesComplete) {
        candidates.sort((a, b) => (b.item.pubDate?.getTime() ?? 0) - (a.item.pubDate?.getTime() ?? 0));
    }
    const requestedLimit = getRouteLimit(ctx, 20);
    const detailLimit = preserveSourceOrder || datesComplete ? requestedLimit : Math.max(20, requestedLimit);
    const items = await pMap(
        candidates.slice(0, detailLimit),
        async ({ item, detailUrl }) => {
            if (item.link.includes('toPhoneSign')) {
                return item;
            }
            const description = await cache.tryGet(detailUrl, async () => {
                const response = await ofetch<{ code: number; data: { content?: string } | null }>(detailUrl);
                if (response.code !== 1 || typeof response.data?.content !== 'string') {
                    throw new Error(`The ECUST notice API did not return article content for ${item.link}.`);
                }
                return response.data.content;
            });
            return { ...item, description };
        },
        { concurrency: 3 }
    );

    return {
        title: '华东理工继续教育学院',
        description: '学院公告',
        link: baseUrl,
        item: items,
    };
}
