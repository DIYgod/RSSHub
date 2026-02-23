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
};

const signRequest = async (url: string, ts: string, method = 'GET'): Promise<string> => {
    const urlPath = new URL(url).pathname;
    const rawSign = `${method.toUpperCase()}&${encodeURIComponent(urlPath)}&${ts}`;
    const keyData = new TextEncoder().encode(apiSecret);
    const messageData = new TextEncoder().encode(rawSign);
    const key = await globalThis.crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']);
    const signature = await globalThis.crypto.subtle.sign('HMAC', key, messageData);
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
    const lines = [];
    const wishCount = getWishCount(subject.wish_count);
    if (wishCount > 0) {
        lines.push(`想看人数：${wishCount}，`);
    }
    if (subject.intro) {
        lines.push(subject.intro);
    }
    return lines.join('\n\n');
};

export const route: Route = {
    path: '/tv/coming/:routeParams?',
    categories: ['social-media'],
    example: '/douban/tv/coming',
    parameters: { routeParams: '额外参数；支持 sortby（hot/time）、count（条目数量）' },
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
    description: `| 额外参数 | 含义             | 接受的值 | 默认值 |
| -------- | ---------------- | -------- | ------ |
| sortby   | 排序方式         | hot/time | hot    |
| count    | 请求上游返回数量 | 正整数   | 10     |

  用例：\`/douban/tv/coming/sortby=hot&count=10\`

::: tip
  服务端请求固定使用 \`sortby=hot\` 拉取数据，再按 \`sortby\` 参数在本地重排；条目数量可通过 \`count\` 调整，仍可叠加 RSSHub 通用参数 \`limit\`。
:::`,
};

async function handler(ctx) {
    const routeParams = Object.fromEntries(new URLSearchParams(ctx.req.param('routeParams')));
    const sortbyParam = (routeParams.sortby as string) || ctx.req.query('sortby');
    const countParam = (routeParams.count as string) || ctx.req.query('count');

    const sortby = sortbyParam === 'time' ? 'time' : 'hot';
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
        },
        4 * 60 * 60
    )) as ComingSoonResponse;
    const subscriptionCount = data.count ?? 0;
    const total = data.total ?? 0;
    const sortedSubjects = (data.subjects ?? []).toSorted((a, b) => {
        if (sortby === 'time') {
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
        description: `即将播出的剧集，请求参数: count=${subscriptionCount}, total=${total}, sortby=${sortby}, request_count=${requestCount}`,
        item: sortedSubjects.map((subject) => {
            const link = subject.url || subject.sharing_url || `https://movie.douban.com/subject/${subject.id}/`;
            const category = subject.card_subtitle ? [subject.card_subtitle] : (subject.genres ?? []);
            const pubDate = sortby === 'time' ? getPubDate(subject.pubdate) : undefined;
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
