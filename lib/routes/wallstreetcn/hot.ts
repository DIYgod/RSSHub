import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/hot/:period?',
    categories: ['finance'],
    example: '/wallstreetcn/hot',
    parameters: { period: '时期，可选 `day` 即 当日 或 `week` 即 当周，默认为当日' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: true,
        supportScihub: false,
    },
    radar: [
        {
            source: ['wallstreetcn.com/'],
        },
    ],
    name: '最热文章',
    maintainers: ['nczitzk'],
    handler,
    url: 'wallstreetcn.com/',
};

function parseSourceTime(value?: string | number | null) {
    if ((typeof value !== 'number' && typeof value !== 'string') || (typeof value === 'string' && !value.trim())) {
        return;
    }
    const seconds = Number(value);
    if (!Number.isFinite(seconds)) {
        return;
    }
    const date = parseDate(seconds * 1000);
    return Number.isFinite(date.getTime()) ? date : undefined;
}

async function handler(ctx) {
    const period = ctx.req.param('period') ?? 'day';

    const rootUrl = 'https://wallstreetcn.com';
    const apiRootUrl = 'https://api-one-wscn.awtmt.com';
    const apiUrl = `${apiRootUrl}/apiv1/content/articles/hot?period=all`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    let items = response.data.data[`${period}_items`].map((item) => ({
        guid: item.id,
        link: item.uri,
        pubDate: parseSourceTime(item.display_time),
    }));

    items = await pMap<DataItem, DataItem>(
        items,
        async (item) => {
            const details = await cache.tryGet<Pick<DataItem, 'title' | 'author' | 'description' | 'category' | 'enclosure_type' | 'enclosure_url' | 'itunes_item_image' | 'itunes_duration'>>(
                `wallstreetcn:hot:detail-with-author:${item.link}`,
                async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: `${apiRootUrl}/apiv1/content/articles/${item.guid}?extract=0`,
                    });

                    const data = detailResponse.data.data;

                    const details: Pick<DataItem, 'title' | 'author' | 'description' | 'category' | 'enclosure_type' | 'enclosure_url' | 'itunes_item_image' | 'itunes_duration'> = {
                        title: data.title || data.content_text,
                        author: data.source_name || data.author?.display_name,
                        description: data.content + (data.content_more ?? ''),
                        category: data.asset_tags?.map((tag) => tag.name) ?? [],
                    };

                    if (data.audio_uri) {
                        details.enclosure_type = 'audio/mpeg';
                        details.enclosure_url = data.audio_uri;
                        details.itunes_item_image = data.image?.uri ?? '';
                        details.itunes_duration = data.audio_info?.duration ?? '';
                    }

                    return details;
                }
            );
            return { ...item, ...details };
        },
        { concurrency: 3 }
    );

    return {
        title: '华尔街见闻 - 最热文章',
        link: rootUrl,
        item: items,
        itunes_author: '华尔街见闻',
        image: 'https://static.wscn.net/wscn/_static/favicon.png',
    };
}
