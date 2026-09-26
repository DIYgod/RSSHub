import pMap from 'p-map';
import sanitizeHtml from 'sanitize-html';

import { parseToken } from '@/routes/xueqiu/cookies';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
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
        requirePuppeteer: false,
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

interface Status {
    id: number;
    target: string;
    created_at: number;
    title?: string;
    text?: string;
    description?: string;
    mark?: number;
    legal_user_visible?: boolean;
    user?: { screen_name?: string; profile_image_url?: string; photo_domain?: string };
}

interface StatusDetail {
    text?: string;
    description?: string;
    error_code?: number | string;
    image_info_list?: Array<{ filename?: string }>;
    retweeted_status?: {
        user?: { screen_name?: string };
        text?: string;
    };
}

interface ErrorLike {
    data?: unknown;
    response?: {
        _data?: unknown;
        status?: number;
        statusCode?: number;
    };
    status?: number;
    statusCode?: number;
}

const permanentErrorCodes = new Set(['20210']);

const stripHtml = (html: string): string => sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} });

// Build a feed item from the timeline list data alone (no detail request).
const buildListItem = (item: Status) => {
    const description = item.text || item.description || '';
    return {
        title: item.title || stripHtml(description),
        description,
        pubDate: parseDate(item.created_at),
        link: rootUrl + item.target,
    };
};

const buildTitle = (item: Status, detail: StatusDetail): string => {
    if (item.title) {
        return item.title;
    }
    return stripHtml(item.text || item.description || detail.text || detail.description || '');
};

const buildDescription = (detail: StatusDetail): string => {
    let text = detail.text?.trim() ? detail.text : detail.description || '';
    const images = detail.image_info_list ?? [];
    for (const img of images) {
        if (img?.filename) {
            text += `<br><img src="https://xqimg.imedao.com/${img.filename}">`;
        }
    }
    if (detail.retweeted_status?.text) {
        text += `<blockquote>${detail.retweeted_status.user?.screen_name ?? ''}:&nbsp;${detail.retweeted_status.text}</blockquote>`;
    }
    return text;
};

const getErrorCode = (value: unknown): number | string | undefined => {
    if (!value || typeof value !== 'object') {
        return;
    }
    const errorCode = (value as StatusDetail).error_code;
    return typeof errorCode === 'number' || typeof errorCode === 'string' ? errorCode : undefined;
};

const getFailureContext = (error: unknown) => {
    if (!error || typeof error !== 'object') {
        return {};
    }
    const errorLike = error as ErrorLike;
    return {
        status: errorLike.response?.status ?? errorLike.response?.statusCode ?? errorLike.status ?? errorLike.statusCode,
        errorCode: getErrorCode(errorLike.response?._data) ?? getErrorCode(errorLike.data),
    };
};

const isPermanentError = (errorCode?: number | string): boolean => errorCode !== undefined && permanentErrorCodes.has(String(errorCode));

const logDetailFallback = (item: Status, classification: 'empty-detail' | 'permanent' | 'transient', status?: number, errorCode?: number | string) =>
    logger.debug(`xueqiu user detail fallback: item=${item.id} target=${item.target} status=${status ?? 'unknown'} errorCode=${errorCode ?? 'none'} classification=${classification}`);

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
            try {
                return await cache.tryGet(item.target, async () => {
                    // legal_user_visible 为 true 时列表已含完整内容，无需再请求详情
                    if (item.legal_user_visible) {
                        return buildListItem(item);
                    }

                    let detail: StatusDetail;
                    try {
                        detail = await ofetch(`${apiUrl}/statuses/show.json`, {
                            query: { id: item.id },
                            headers: { Cookie: cookie, Referer: link },
                            retry: 0,
                        });
                    } catch (error) {
                        const { status, errorCode } = getFailureContext(error);
                        if (isPermanentError(errorCode)) {
                            logDetailFallback(item, 'permanent', status, errorCode);
                            return buildListItem(item);
                        }
                        logDetailFallback(item, 'transient', status, errorCode);
                        throw error;
                    }

                    const errorCode = getErrorCode(detail);
                    if (isPermanentError(errorCode)) {
                        logDetailFallback(item, 'permanent', 200, errorCode);
                        return buildListItem(item);
                    }
                    if (errorCode !== undefined) {
                        logDetailFallback(item, 'transient', 200, errorCode);
                        throw new Error(`Xueqiu detail returned error code ${errorCode}`);
                    }

                    const detailItem = buildDetailItem(item, detail);
                    if (!detailItem.description.trim()) {
                        logDetailFallback(item, 'empty-detail', 200);
                        throw new Error('Xueqiu detail response is empty');
                    }
                    return detailItem;
                });
            } catch {
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
