import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

import { renderDescription } from './templates/description';
import { rootUrl } from './utils';

export const route: Route = {
    path: '/brief',
    categories: ['traditional-media'],
    example: '/yicai/brief',
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
            source: ['yicai.com/brief'],
        },
    ],
    name: '正在',
    maintainers: ['sanmmm', 'nczitzk'],
    handler,
    url: 'yicai.com/brief',
};

async function handler(ctx) {
    const currentUrl = `${rootUrl}/brief`;
    const apiUrl = `${rootUrl}/api/ajax/getbrieflist?type=0&page=1&pagesize=${getRouteLimit(ctx, 50)}`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const items = response.data.map((item) => ({
        title: item.indexTitle,
        link: `${rootUrl}${item.url}`,
        description: renderDescription({
            intro: typeof item.LiveContent === 'string' ? item.LiveContent : undefined,
            image: { src: getImageUrl(item.LiveImages) },
            description: typeof item.LiveContent === 'string' && item.LiveContent ? undefined : item.newcontent,
        }),
        pubDate: getPublicationDate(item.CreateDate, item.datekey, item.hm),
    }));

    return {
        title: '第一财经 - 正在',
        link: currentUrl,
        item: items,
    };
}

function getPublicationDate(value: unknown, dateKey: unknown, time: unknown): Date | undefined {
    if (typeof value === 'string' && value.trim()) {
        const hasOffset = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(value);
        const date = hasOffset ? parseDate(value) : parseDate(value, ['YYYY-MM-DDTHH:mm:ss', 'YYYY-MM-DDTHH:mm:ss.SSS'], true);
        if (Number.isFinite(date.getTime())) {
            return hasOffset ? date : timezone(date, 8);
        }
    }
    if (typeof dateKey !== 'string' || !dateKey.trim() || typeof time !== 'string' || !time.trim()) {
        return;
    }
    const date = parseDate(`${dateKey.trim()} ${time.trim()}`, ['YYYY-MM-DD HH:mm', 'YYYY.MM.DD HH:mm'], true);
    return Number.isFinite(date.getTime()) ? timezone(date, 8) : undefined;
}

function getImageUrl(value: unknown): string | undefined {
    if (typeof value !== 'string' || !value) {
        return;
    }
    try {
        const url = new URL(value);
        if (['http:', 'https:'].includes(url.protocol) && !url.username && !url.password) {
            return value;
        }
    } catch {
        // Ignore unsupported source image URLs.
    }
    return;
}
