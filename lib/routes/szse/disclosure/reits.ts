import type { Context } from 'hono';

import type { Data, DataItem, Language, Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const handler = async (ctx: Context): Promise<Data> => {
    const limit = ctx.req.query('limit') ?? '50';

    const baseUrl = 'https://reits.szse.cn';
    const staticBaseUrl = 'https://disc.static.szse.cn';
    const apiUrl = new URL('api/disc/info/find/tannInfo', baseUrl).href;
    const targetUrl = new URL('disclosure/index.html', baseUrl).href;

    const response = await ofetch(apiUrl, {
        method: 'GET',
        query: {
            type: '4',
            pageSize: limit,
            pageNum: '1',
            plateFlag: 'szse',
        },
    });

    const language = 'zh-CN' as Language;

    const items: DataItem[] = response.data.map((item): DataItem => {
        const title: string = item.title;
        const pubDate = item.publishTime;
        const linkUrl = `disclosure/notice/index.html?${item.id}`;
        const categories: string[] = [item.secCode, item.secName].filter(Boolean);
        const guid = `szse-reits-${item.id}`;
        const updated: string = item.publishTime;

        const processedItem: DataItem = {
            title,
            pubDate: pubDate ? timezone(parseDate(pubDate), 8) : undefined,
            link: new URL(linkUrl, baseUrl).href,
            category: categories,
            guid,
            id: guid,
            updated: updated ? timezone(parseDate(updated), 8) : undefined,
            language,
        };

        const enclosureUrl: string = new URL(item.attachPath, staticBaseUrl).href;
        const enclosureType = `application/${item.attachFormat.toLowerCase()}`;

        return {
            ...processedItem,
            enclosure_url: enclosureUrl,
            enclosure_type: enclosureType,
            enclosure_title: title,
        };
    });

    return {
        title: '深圳证券交易所 - 公募REITs信息披露',
        description: '深圳证券交易所公募REITs信息平台信息披露',
        link: targetUrl,
        item: items,
        allowEmpty: true,
        language,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/disclosure/reits',
    name: '公募REITs信息披露',
    url: 'reits.szse.cn',
    maintainers: ['weixshaw'],
    handler,
    example: '/szse/disclosure/reits',
    parameters: undefined,
    description: undefined,
    categories: ['finance'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['reits.szse.cn/disclosure/index.html'],
            target: '/disclosure/reits',
        },
    ],
    view: ViewType.Articles,
};
