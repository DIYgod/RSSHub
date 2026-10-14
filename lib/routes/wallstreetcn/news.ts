import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const titles = {
    global: '最新',
    shares: '股市',
    bonds: '债市',
    commodities: '商品',
    forex: '外汇',
    finance: '金融',
    enterprise: '公司',
    'asset-manage': '资管',
    tmt: '科技',
    ai: '硬AI',
    estate: '地产',
    car: '汽车',
    medicine: '医药',
};

export const route: Route = {
    path: '/news/:category?',
    categories: ['finance'],
    example: '/wallstreetcn/news',
    parameters: { category: '资讯分类，默认为 `global`，可选值见下表' },
    features: { supportPodcast: true },
    radar: [
        {
            source: ['wallstreetcn.com/news/:category', 'wallstreetcn.com/'],
        },
    ],
    name: '资讯',
    maintainers: ['nczitzk'],
    handler,
    description: `| id           | 分类  |
| ------------ | ----- |
| global       | 最新  |
| shares       | 股市  |
| bonds        | 债市  |
| commodities  | 商品  |
| forex        | 外汇  |
| finance      | 金融  |
| enterprise   | 公司  |
| asset-manage | 资管  |
| tmt          | 科技  |
| ai           | 硬 AI |
| estate       | 地产  |
| car          | 汽车  |
| medicine     | 医药  |`,
};

function parseSourceTime(value: unknown) {
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

function parseLimit(value: string | undefined, defaultLimit: number) {
    const limit = Number(value);
    return Number.isFinite(limit) && limit >= 1 ? Math.floor(limit) : defaultLimit;
}

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'global';

    const rootUrl = 'https://wallstreetcn.com';
    const apiRootUrl = 'https://api-one.wallstcn.com';
    const currentUrl = `${rootUrl}/news/${category}`;
    const apiUrl = `${apiRootUrl}/apiv1/content/information-flow?channel=${category}&accept=article&limit=${parseLimit(ctx.req.query('limit'), 25)}`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    let items = response.data.data.items
        .filter((item) => item.resource_type !== 'ad')
        .map((item) => ({
            type: item.resource_type,
            guid: item.resource.id,
            link: item.resource.uri,
            pubDate: parseSourceTime(item.resource.display_time),
        }));

    items = await pMap<DataItem & { type?: string }, DataItem | null>(
        items,
        async (item) => {
            const details = await cache.tryGet<Pick<DataItem, 'title' | 'author' | 'description' | 'category' | 'enclosure_type' | 'enclosure_url' | 'itunes_item_image' | 'itunes_duration'> | null>(
                `wallstreetcn:news:detail-with-author:${item.link}`,
                async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: `${apiRootUrl}/apiv1/content/${item.type === 'live' ? `lives/${item.guid}` : `articles/${item.guid}?extract=0`}`,
                    });

                    const responseData = detailResponse.data;

                    // The source returns a non-success code for missing or deleted content.
                    if (responseData.code !== 20000) {
                        return null;
                    }

                    const data = responseData.data;

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
            if (!details) {
                return null;
            }
            const current = { ...item, ...details };
            delete current.type;
            return current;
        },
        { concurrency: 3 }
    );

    items = items.filter((item) => item !== null);

    return {
        title: `华尔街见闻 - 资讯 - ${titles[category]}`,
        link: currentUrl,
        item: items,
        itunes_author: '华尔街见闻',
        image: 'https://static.wscn.net/wscn/_static/favicon.png',
    };
}
