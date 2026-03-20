import { load } from 'cheerio';

import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const publicApiBaseUrl = 'https://api-public.lingowhale.com';
const apiBaseUrl = 'https://api.lingowhale.com';
const passportApiBaseUrl = 'https://api-passport.shenyandayi.com';
const webBaseUrl = 'https://lingowhale.com';
const defaultLimit = 10;
const maxLimit = 50;
const refreshAheadSeconds = 24 * 60 * 60;

type LingowhaleAuthState = {
    accessToken: string;
    authToken: string;
    bId: string;
    uid?: string;
};

type LingowhaleApiResponse<T> = {
    code: number;
    msg: string;
    data: T;
};

type LingowhaleFeedItem = {
    entry_id: string;
    entry_type: number;
    title: string;
    description?: string;
    content?: string;
    pub_time?: number;
    surface_url?: string;
    channel?: {
        channel_id: string;
        name?: string;
        description?: string;
        surface_url?: string;
    };
    info_source?: {
        info_source_name?: string;
    };
};

type LingowhaleFeedListData = {
    feed_list: LingowhaleFeedItem[];
};

type LingowhaleUrlInfo = {
    url?: string;
    html_content?: string;
    content?: string;
    title?: string;
    author?: string;
    publish_time?: string;
};

type LingowhaleEntryDetailData = {
    url_info?: LingowhaleUrlInfo;
};

type LingowhaleRefreshData = {
    uid?: string;
    b_id?: string;
    auth_token?: string;
    access_token?: string;
};

type LingowhaleCopyData = {
    entry_id: string;
    entry_type: number;
};

let authState: LingowhaleAuthState | undefined;

export const route: Route = {
    path: '/channel/:channelId',
    categories: ['reading'],
    example: '/lingowhale/channel/69ad46deaf380309fcb1dd86',
    parameters: {
        channelId: '语鲸频道 ID，需要先在语鲸 Web 端创建订阅频道后获取。',
    },
    features: {
        requireConfig: [
            {
                name: 'LINGOWHALE_SESSION',
                description: '推荐使用的单环境变量，值为 JSON：`{"uid":"...","bId":"...","authToken":"...","accessToken":"..."}`。',
            },
            {
                name: 'LINGOWHALE_ACCESS_TOKEN',
                optional: true,
                description: '兼容旧配置方式：语鲸 Web 端本地存储中的初始 AccessToken。',
            },
            {
                name: 'LINGOWHALE_AUTH_TOKEN',
                optional: true,
                description: '兼容旧配置方式：语鲸 Web 端本地存储中的初始 AuthToken。',
            },
            {
                name: 'LINGOWHALE_B_ID',
                optional: true,
                description: '兼容旧配置方式：语鲸 Web 端本地存储中的 BID。',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '频道全文',
    maintainers: ['ZHA30'],
    handler,
    description: `使用语鲸频道 ID 抓取频道订阅流，并通过受保护的 \`entry/detail\` 接口获取全文。

该路由会先访问公开频道流，再使用配置中的种子 token 自动续期并拉取全文；如果自动续期失败，请重新从语鲸 Web 端本地存储中更新 \`BID\`、\`AuthToken\` 和 \`AccessToken\`。`,
};

const clampLimit = (limit?: string) => {
    const parsed = Number.parseInt(limit ?? '', 10);

    if (Number.isNaN(parsed) || parsed <= 0) {
        return defaultLimit;
    }

    return Math.min(parsed, maxLimit);
};

const decodeJwtExp = (token: string) => {
    try {
        const [, payload] = token.split('.');
        const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
        return typeof decoded.exp === 'number' ? decoded.exp : undefined;
    } catch {
        return;
    }
};

const ensureAuthState = () => {
    if (authState) {
        return authState;
    }

    if (!config.lingowhale?.accessToken || !config.lingowhale?.authToken || !config.lingowhale?.bId) {
        throw new ConfigNotFoundError('Lingowhale RSS is disabled due to the lack of relevant config. Please provide LINGOWHALE_SESSION, or the legacy trio: LINGOWHALE_ACCESS_TOKEN, LINGOWHALE_AUTH_TOKEN, and LINGOWHALE_B_ID.');
    }

    authState = {
        uid: config.lingowhale.uid,
        accessToken: config.lingowhale.accessToken,
        authToken: config.lingowhale.authToken,
        bId: config.lingowhale.bId,
    };

    return authState;
};

const getAuthHeaders = (state: LingowhaleAuthState) => ({
    ...(state.uid
        ? {
              'U-Id': state.uid,
          }
        : {}),
    'Access-Token': state.accessToken,
    'Auth-Token': state.authToken,
    'B-Id': state.bId,
});

const refreshAuthState = async (force = false) => {
    const currentState = ensureAuthState();
    const accessTokenExp = decodeJwtExp(currentState.accessToken);

    if (!force && currentState.uid && accessTokenExp && accessTokenExp - Date.now() / 1000 > refreshAheadSeconds) {
        return currentState;
    }

    try {
        const response = await ofetch<LingowhaleApiResponse<LingowhaleRefreshData>>(`${passportApiBaseUrl}/api/user/refresh_token`, {
            method: 'POST',
            headers: {
                ...getAuthHeaders(currentState),
                'Content-Type': 'application/json',
            },
        });

        if (response.code !== 0 || !response.data?.access_token || !response.data?.auth_token || !response.data?.b_id) {
            if (!force) {
                return currentState;
            }
            throw new Error(response.msg || 'Lingowhale token refresh failed');
        }

        authState = {
            accessToken: response.data.access_token,
            authToken: response.data.auth_token,
            bId: response.data.b_id,
            uid: response.data.uid,
        };

        return authState;
    } catch (error) {
        if (!force) {
            return currentState;
        }
        throw new Error(`Lingowhale token refresh failed: ${error instanceof Error ? error.message : String(error)}`, {
            cause: error,
        });
    }
};

const fetchEntryDetail = async (entryId: string, entryType: number) => {
    let currentState = await refreshAuthState();

    const request = (state: LingowhaleAuthState) =>
        ofetch<LingowhaleApiResponse<LingowhaleEntryDetailData>>(`${apiBaseUrl}/api/entry/detail`, {
            query: {
                entry_id: entryId,
                entry_type: entryType,
            },
            headers: getAuthHeaders(state),
        });

    let response = await request(currentState);

    if (response.code === 988) {
        currentState = await refreshAuthState(true);
        response = await request(currentState);
    }

    if (response.code !== 0) {
        throw new Error(response.msg || `Lingowhale entry detail request failed for ${entryId}`);
    }

    return response.data;
};

const fetchCopiedEntryDetail = async (entryId: string, entryType: number) => {
    let currentState = await refreshAuthState();

    const copyRequest = (state: LingowhaleAuthState) =>
        ofetch<LingowhaleApiResponse<LingowhaleCopyData>>(`${apiBaseUrl}/api/readers/resource/copy`, {
            method: 'POST',
            body: {
                entry_id: entryId,
                entry_type: entryType,
                copy_source: 1,
            },
            headers: {
                ...getAuthHeaders(state),
                'Content-Type': 'application/json',
            },
        });

    let copyResponse = await copyRequest(currentState);

    if (copyResponse.code === 988) {
        currentState = await refreshAuthState(true);
        copyResponse = await copyRequest(currentState);
    }

    if (copyResponse.code !== 0 || !copyResponse.data?.entry_id) {
        return;
    }

    return fetchEntryDetail(copyResponse.data.entry_id, copyResponse.data.entry_type);
};

const cleanHtmlContent = (htmlContent?: string) => {
    if (!htmlContent) {
        return '';
    }

    const $ = load(htmlContent);
    const allowedStyleProperties = new Set(['text-indent', 'text-align', 'font-weight', 'font-style', 'text-decoration']);

    $('dplv-pos-group, dplv-pos').each((_, element) => {
        $(element).replaceWith($(element).contents());
    });

    $('[position_id], [leaf], [data-deeplang-h1]').each((_, element) => {
        $(element).removeAttr('position_id');
        $(element).removeAttr('leaf');
        $(element).removeAttr('data-deeplang-h1');
    });

    $('[style]').each((_, element) => {
        const style = $(element).attr('style');

        if (!style) {
            $(element).removeAttr('style');
            return;
        }

        const cleanedStyle = style
            .split(';')
            .map((declaration) => declaration.trim())
            .filter(Boolean)
            .map((declaration) => {
                const [property, ...valueParts] = declaration.split(':');
                const normalizedProperty = property?.trim().toLowerCase();
                const value = valueParts.join(':').trim();

                if (!normalizedProperty || !value || !allowedStyleProperties.has(normalizedProperty)) {
                    return null;
                }

                return `${normalizedProperty}: ${value}`;
            })
            .filter(Boolean)
            .join('; ');

        if (cleanedStyle) {
            $(element).attr('style', cleanedStyle);
        } else {
            $(element).removeAttr('style');
        }
    });

    $('script').remove();

    return $('body').html() || $.root().html() || '';
};

const getItemLink = (url: string | undefined, entryId: string) => {
    if (!url) {
        return `${webBaseUrl}/reader/web/${entryId}`;
    }

    if (url.startsWith('http://')) {
        return `https://${url.slice('http://'.length)}`;
    }

    return url;
};

async function handler(ctx) {
    const channelId = ctx.req.param('channelId');
    const limit = clampLimit(ctx.req.query('limit'));

    const feedResponse = await ofetch<LingowhaleApiResponse<LingowhaleFeedListData>>(`${publicApiBaseUrl}/api/feed/v2/feed/subscription`, {
        method: 'POST',
        body: {
            cursor: '',
            sort_type: 2,
            limit,
            filter_unread: false,
            channel_ids: [channelId],
        },
    });

    if (feedResponse.code !== 0) {
        throw new Error(feedResponse.msg || `Lingowhale feed request failed for channel ${channelId}`);
    }

    const feedItems = feedResponse.data.feed_list ?? [];
    const channelMeta = feedItems[0]?.channel;

    const items = (
        await Promise.all(
            feedItems.map(async (feedItem) => {
                const cacheKey = `lingowhale:entry:${feedItem.entry_id}`;

                try {
                    return await cache.tryGet(cacheKey, async () => {
                        const detail = await fetchEntryDetail(feedItem.entry_id, feedItem.entry_type);
                        let urlInfo = detail.url_info;

                        if (!urlInfo?.url) {
                            const copiedDetail = await fetchCopiedEntryDetail(feedItem.entry_id, feedItem.entry_type);
                            if (copiedDetail?.url_info?.url) {
                                urlInfo = {
                                    ...copiedDetail.url_info,
                                    html_content: urlInfo?.html_content || copiedDetail.url_info.html_content,
                                    content: urlInfo?.content || copiedDetail.url_info.content,
                                    title: urlInfo?.title || copiedDetail.url_info.title,
                                    author: urlInfo?.author || copiedDetail.url_info.author,
                                    publish_time: urlInfo?.publish_time || copiedDetail.url_info.publish_time,
                                };
                            }
                        }

                        const link = getItemLink(urlInfo?.url, feedItem.entry_id);

                        return {
                            title: urlInfo?.title || feedItem.title,
                            link,
                            description: cleanHtmlContent(urlInfo?.html_content) || feedItem.content || feedItem.description,
                            pubDate: urlInfo?.publish_time ? timezone(parseDate(urlInfo.publish_time), +8) : feedItem.pub_time ? parseDate(feedItem.pub_time * 1000) : undefined,
                            author: urlInfo?.author || feedItem.info_source?.info_source_name,
                            image: feedItem.surface_url,
                        };
                    });
                } catch (error) {
                    logger.warn(`lingowhale: skip failed item ${feedItem.entry_id}: ${error instanceof Error ? error.message : String(error)}`);
                    return null;
                }
            })
        )
    ).filter((item): item is DataItem => item !== null);

    if (feedItems.length > 0 && items.length === 0) {
        throw new Error(`Lingowhale route failed to fetch any item details for channel ${channelId}`);
    }

    return {
        title: channelMeta?.name || `语鲸频道 ${channelId}`,
        description: channelMeta?.description,
        link: `${webBaseUrl}/channels?channel_id=${channelId}`,
        image: channelMeta?.surface_url,
        language: 'zh-CN',
        item: items,
    };
}
