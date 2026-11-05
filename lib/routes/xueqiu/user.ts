import { FetchError } from 'ofetch';
import pMap from 'p-map';
import sanitizeHtml from 'sanitize-html';

import { parseToken } from '@/routes/xueqiu/cookies';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://xueqiu.com';
const apiUrl = 'https://api.xueqiu.com';

export const route: Route = {
    path: '/user/:id/:type?',
    categories: ['finance'],
    example: '/xueqiu/user/8152922548',
    parameters: { id: '用户 id, 可在用户主页 URL 中找到', type: '动态的类型, 不填则默认全部' },
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['xueqiu.com/u/:id'],
            target: '/user/:id',
        },
    ],
    name: '用户动态',
    maintainers: ['imlonghao'],
    handler,
    description: `| 原发布 | 长文 | 问答 | 热门 | 交易 |
| ------ | ---- | ---- | ---- | ---- |
| 0      | 2    | 4    | 9    | 11   |`,
};

interface Status extends Pick<StatusDetail, 'image_info_list' | 'retweeted_status'> {
    id: number;
    target: string;
    created_at: number;
    title?: string;
    text?: string;
    description?: string;
    mark?: number;
    legal_user_visible?: boolean;
    truncated?: boolean;
    user?: { screen_name?: string; profile_image_url?: string; photo_domain?: string };
}

interface StatusDetail {
    text?: string;
    description?: string;
    error_code?: number | string;
    image_info_list?: Array<{ filename?: string }> | null;
    retweeted_status?: {
        user?: { screen_name?: string } | null;
        text?: string;
        description?: string;
    };
}

// 20210 is the only code observed for deleted posts. No other permanent codes are known, so all others are retried.
const permanentErrorCodes = new Set(['20210']);

const stripHtml = (html: string): string => sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} });

const buildTitle = (item: Status, detail: StatusDetail): string => {
    if (item.title) {
        return item.title;
    }
    return stripHtml(item.text || item.description || detail.text || detail.description || '');
};

const buildDescription = (detail: StatusDetail): string => {
    let text = detail.text?.trim() ? detail.text : detail.description || '';
    const images = Array.isArray(detail.image_info_list) ? detail.image_info_list : [];
    for (const img of images) {
        if (img?.filename) {
            text += `<br><img src="https://xqimg.imedao.com/${img.filename}">`;
        }
    }
    const retweet = detail.retweeted_status;
    const retweetText = retweet?.text?.trim() ? retweet.text : retweet?.description;
    if (retweetText) {
        text += `<blockquote>${retweet?.user?.screen_name ?? ''}:&nbsp;${retweetText}</blockquote>`;
    }
    return text;
};

// For long posts, and for reposts of long posts, the timeline leaves `text` empty and only sends a shortened `description`.
// Everywhere else the timeline text matches show.json, so the detail request can be skipped.
const hasFullText = (item: Status): boolean => item.truncated === false && Boolean(item.text?.trim()) && (!item.retweeted_status || Boolean(item.retweeted_status.text?.trim()));

// Build a feed item from the timeline list data alone (no detail request).
const buildListItem = (item: Status) => ({
    title: item.title || stripHtml(item.text || item.description || ''),
    description: buildDescription(item),
    pubDate: parseDate(item.created_at),
    link: rootUrl + item.target,
});

const isPermanentError = (errorCode?: number | string): boolean => errorCode !== undefined && permanentErrorCodes.has(String(errorCode));

const buildDetailItem = (item: Status, detail: StatusDetail) => ({
    title: buildTitle(item, detail),
    description: buildDescription(detail),
    pubDate: parseDate(item.created_at),
    link: rootUrl + item.target,
});

const extractProfileImage = (user: any): string | undefined => {
    if (!user?.profile_image_url || !user?.photo_domain) {
        return undefined;
    }

    const imageUrls = user.profile_image_url.split(',').filter(Boolean);
    if (imageUrls.length === 0) {
        return undefined;
    }

    // Priority order for image sizes
    const sizePriority = ['!180x180.png', '!50x50.png', '!30x30.png'];
    const selectedImageUrl = sizePriority.map((size) => imageUrls.find((url) => url.includes(size))).find(Boolean) || imageUrls[0];
    const baseDomain = user.photo_domain.startsWith('//') ? `https:${user.photo_domain}` : user.photo_domain;

    return `${baseDomain}${selectedImageUrl}`;
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const type = ctx.req.param('type') || 10;
    const source = type === '11' ? '买卖' : '';
    const typename = {
        10: '全部',
        0: '原发布',
        2: '长文',
        4: '问答',
        9: '热门',
        11: '交易',
    };

    const link = `${rootUrl}/u/${id}`;
    const cookie = await parseToken(link);

    const response = await ofetch(`${apiUrl}/v4/statuses/user_timeline.json`, {
        query: {
            user_id: id,
            type,
            source,
        },
        headers: {
            Cookie: cookie,
            Referer: link,
        },
    });

    const data: Status[] = response.statuses.filter((s) => s.mark !== 1); // 去除置顶动态

    // Use p-map to limit concurrency and avoid triggering Xueqiu show.json rate limiting.
    const items = await pMap(
        data,
        async (item) => {
            // Complete list entries already contain the current content.
            if (item.legal_user_visible || hasFullText(item)) {
                return buildListItem(item);
            }

            try {
                // Only the raw detail is cached; list fields are assembled outside the cache.
                const cachedDetail = await cache.tryGet(`xueqiu:user:detail:${item.id}`, async () => {
                    let detail: StatusDetail;
                    try {
                        detail = await ofetch(`${apiUrl}/statuses/show.json`, {
                            query: { id: item.id },
                            headers: { Cookie: cookie, Referer: link },
                            retry: 0,
                        });
                    } catch (error) {
                        const errorCode = error instanceof FetchError ? error.data?.error_code : undefined;
                        if (isPermanentError(errorCode)) {
                            return {};
                        }
                        throw error;
                    }

                    // Cache an empty result only for permanent errors; throw otherwise so nothing is cached.
                    if (isPermanentError(detail.error_code)) {
                        return {};
                    }
                    if (detail.error_code !== undefined) {
                        throw new Error(`Xueqiu detail returned error code ${detail.error_code}`);
                    }
                    if (!buildDescription(detail).trim()) {
                        throw new Error('Xueqiu detail response is empty');
                    }
                    return { detail };
                });

                return cachedDetail.detail ? buildDetailItem(item, cachedDetail.detail) : buildListItem(item);
            } catch {
                // Transient failure: provide a fallback item without caching, retry next request.
                return buildListItem(item);
            }
        },
        { concurrency: 3 }
    );

    const user = data[0]?.user;

    return {
        title: `${user?.screen_name ?? id} 的雪球${typename[type]}动态`,
        link,
        description: `${user?.screen_name ?? id} 的雪球${typename[type]}动态`,
        image: extractProfileImage(user),
        item: items,
        allowEmpty: true,
    };
}
