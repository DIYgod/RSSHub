import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { getRouteLimit } from '@/utils/route-limit';
import { compareDates, parseDate } from '@/utils/time';

import { getNotices, getPreviewUrl } from './utils';

const baseUrl = 'https://e.ecust.edu.cn';

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
            title: item.title,
            link: item.url ? new URL(item.url, baseUrl).href : `${baseUrl}/engine2/d/${item.id}/${engineInstanceId}/0`,
            pubDate: parseDate(item.publishTime, 8),
            author: item.author || undefined,
        } satisfies DataItem,
        detailUrl: new URL(item.dataUrl, baseUrl).href,
    }));
    const preserveSourceOrder = ctx.req.query('sorted') === 'false';
    if (!preserveSourceOrder) {
        candidates.sort((a, b) => compareDates(b.item.pubDate, a.item.pubDate));
    }
    const items = await pMap(
        candidates.slice(0, getRouteLimit(ctx, 20)),
        async ({ item, detailUrl }) => {
            if (item.link.includes('toPhoneSign')) {
                return item;
            }
            const description = await cache.tryGet(detailUrl, async () => {
                const response = await ofetch<{ data: { content: string } }>(detailUrl);
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
