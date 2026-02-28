import { webcrypto } from 'node:crypto';

import { config } from '@/config';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const apiUrl = 'https://frodo.douban.com/api/v2/tv/coming_soon';
const apiKey = '0dad551ec0f84ed02907ff5c42e8ec70';
const apiSecret = 'bf7dddc7c9cfe6f7';
const apiClientUa = 'api-client/1 com.douban.frodo/7.22.0.beta9(231) Android/23 product/Mate 40 vendor/HUAWEI model/Mate 40 brand/HUAWEI rom/android network/wifi platform/AndroidPad';

type ComingSoonSubject = {
    id: string;
    title: string;
    url?: string;
    sharing_url?: string;
    pubdate?: string[];
    wish_count?: number | string;
    card_subtitle?: string;
    intro?: string;
    genres?: string[];
    cover_url?: string;
    pic?: {
        large?: string;
    };
};

type ComingSoonResponse = {
    count?: number;
    start?: number;
    total?: number;
    subjects?: ComingSoonSubject[];
    msg?: string;
    message?: string;
    reason?: string;
};

const signRequest = async (url: string, ts: string, method = 'GET'): Promise<string> => {
    const urlPath = new URL(url).pathname;
    const rawSign = `${method.toUpperCase()}&${encodeURIComponent(urlPath)}&${ts}`;
    const keyData = new TextEncoder().encode(apiSecret);
    const messageData = new TextEncoder().encode(rawSign);
    const key = await webcrypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']);
    const signature = await webcrypto.subtle.sign('HMAC', key, messageData);
    return Buffer.from(signature).toString('base64');
};

const getPubDateText = (pubdate?: string[]): string | undefined => pubdate?.[0];

const getPubDate = (pubdate?: string[]): Date | undefined => {
    const pubDateText = getPubDateText(pubdate);
    if (!pubDateText) {
        return undefined;
    }

    const datePart = pubDateText.split('(')[0];
    return parseDate(datePart);
};

const getSortTimestamp = (pubdate?: string[]): number => {
    const pubDateText = getPubDateText(pubdate);
    if (!pubDateText) {
        return Number.POSITIVE_INFINITY;
    }

    const datePart = pubDateText.split('(')[0].trim();
    const match = /^(\d{4})(?:-(\d{1,2}))?(?:-(\d{1,2}))?/.exec(datePart);
    if (!match) {
        return Number.POSITIVE_INFINITY;
    }

    const year = Number.parseInt(match[1], 10);
    const month = match[2] ? Number.parseInt(match[2], 10) : 1;
    const day = match[3] ? Number.parseInt(match[3], 10) : 1;
    const timestamp = Date.UTC(year, month - 1, day);
    return Number.isNaN(timestamp) ? Number.POSITIVE_INFINITY : timestamp;
};

const getWishCount = (wishCount?: number | string): number => {
    if (typeof wishCount === 'number') {
        return wishCount;
    }
    if (typeof wishCount === 'string') {
        const parsed = Number.parseInt(wishCount, 10);
        return Number.isNaN(parsed) ? 0 : parsed;
    }
    return 0;
};

const renderDescription = (subject: { intro?: string; wish_count?: number | string }): string => {
    const wishCount = getWishCount(subject.wish_count);
    const wishCountText = wishCount > 0 ? `想看人数：${wishCount}` : '';
    const introText = subject.intro ?? '';
    if (wishCountText && introText) {
        return `${wishCountText}，${introText}`;
    }
    return wishCountText || introText;
};

const buildFetchError = (error: unknown): Error => {
    const status = (error as { response?: { status?: number } })?.response?.status;
    if (status === 429) {
        return new Error('Douban 请求过于频繁（429）。请稍后重试，或降低请求频率。');
    }
    if (status === 403) {
        return new Error('Douban 拒绝访问（403），可能触发反爬策略。请稍后重试。');
    }
    return new Error('Douban 数据请求失败，可能触发反爬或限频，请稍后重试。');
};

export const route: Route = {
    path: '/tv/coming/:sortBy?/:count?',
    categories: ['social-media'],
    example: '/douban/tv/coming',
    parameters: {
        sortBy: '排序方式，可选，支持 `hot` 或 `time`，默认 `hot`',
        count: '请求上游返回数量，可选，正整数，默认 `10`',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '即将播出的剧集',
    maintainers: ['honue'],
    handler,
    description: `| 路径参数 | 含义             | 接受的值 | 默认值 |
| -------- | ---------------- | -------- | ------ |
| sortBy   | 排序方式         | hot/time | hot    |
| count    | 请求上游返回数量 | 正整数   | 10     |

  用例：\`/douban/tv/coming/hot/10\`

::: tip
  服务端请求固定使用 \`sortby=hot\` 拉取数据，再按 \`sortBy\` 参数在本地重排；条目数量可通过 \`count\` 调整，仍可叠加 RSSHub 通用参数 \`limit\`。
:::`,
};

async function handler(ctx) {
    const sortByParam = ctx.req.param('sortBy');
    const countParam = ctx.req.param('count');

    const sortBy = sortByParam === 'time' ? 'time' : 'hot';
    const rawCount = Number.parseInt(countParam || '', 10);
    const requestCount = Number.isNaN(rawCount) || rawCount <= 0 ? 10 : rawCount;

    const ts = new Date().toISOString().slice(0, 10).replaceAll('-', '');
    const searchParams: Record<string, string | number> = {
        start: 0,
        count: requestCount,
        sortby: 'hot',
        os_rom: 'android',
        apiKey,
        _ts: ts,
        _sig: await signRequest(apiUrl, ts),
    };

    const cacheKey = `douban:tv:coming:${requestCount}`;
    const data = (await cache.tryGet(
        cacheKey,
        async () => {
            try {
                const response = await got({
                    method: 'get',
                    url: apiUrl,
                    searchParams,
                    headers: {
                        Accept: 'application/json',
                        'User-Agent': apiClientUa,
                    },
                });
                return response.data as ComingSoonResponse;
            } catch (error) {
                throw buildFetchError(error);
            }
        },
        config.cache.routeExpire,
        false
    )) as ComingSoonResponse;

    if (!Array.isArray(data.subjects)) {
        const details = data.msg || data.message || data.reason;
        throw new Error(`Douban 返回数据结构异常，可能触发反爬或限频。${details ? `上游信息：${details}` : ''}`);
    }
    if (data.subjects.length === 0) {
        throw new Error('Douban 返回空数据，可能触发反爬或限频。请稍后重试。');
    }

    const subscriptionCount = data.count ?? 0;
    const total = data.total ?? 0;
    const sortedSubjects = data.subjects.toSorted((a, b) => {
        if (sortBy === 'time') {
            const timeDiff = getSortTimestamp(a.pubdate) - getSortTimestamp(b.pubdate);
            if (timeDiff !== 0) {
                return timeDiff;
            }
            return getWishCount(b.wish_count) - getWishCount(a.wish_count);
        }
        const wishDiff = getWishCount(b.wish_count) - getWishCount(a.wish_count);
        if (wishDiff !== 0) {
            return wishDiff;
        }
        return 0;
    });
    return {
        title: '豆瓣剧集-即将播出',
        link: 'https://movie.douban.com/tv/',
        description: `即将播出的剧集，请求参数: count=${subscriptionCount}, total=${total}, sortBy=${sortBy}, requestCount=${requestCount}`,
        item: sortedSubjects.map((subject) => {
            const link = subject.url || subject.sharing_url || `https://movie.douban.com/subject/${subject.id}/`;
            const category = subject.card_subtitle ? [subject.card_subtitle] : (subject.genres ?? []);
            const pubDate = sortBy === 'time' ? getPubDate(subject.pubdate) : undefined;
            return {
                title: subject.title,
                category: category.length > 0 ? category : undefined,
                pubDate,
                description: renderDescription(subject),
                link,
                guid: link,
            };
        }),
    };
}
