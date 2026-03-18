import type { Context } from 'hono';

import { config } from '@/config';
import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const siteRoot = 'https://cn.club.vmall.com';
const apiRoot = 'https://sgw-cn.c.huawei.com';
const circleListUrl = `${siteRoot}/mhw/consumer/cn/community/mhwnews/allcircle/`;
const sgwAppId = '9CE75DB648ADD4E0C1556B805C80D2CA';

const requestHeaders = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'request-source': 'H5',
    site: 'zh_CN',
    'Cache-Control': 'no-cache',
    'SGW-APP-ID': sgwAppId,
    'User-Agent': config.trueUA,
};

type ThreadListItem = {
    threadId?: number;
    threadIdStr?: string;
    title?: string;
    description?: string;
    threadShareUrl?: string;
    dateline?: number;
    updateTime?: number;
    author?: string;
    circleName?: string;
};

type ThreadListResponse = {
    errcode: string;
    errmsg?: string;
    data?: {
        threads?: ThreadListItem[];
    };
};

type ImageInfo = {
    imgId?: string;
    path?: string;
    mediumPath?: string;
    thumbPath?: string;
    originHeight?: string;
    originWidth?: string;
};

type ThreadDetailData = {
    id?: string;
    subject?: string;
    content?: string;
    links?: Array<{
        id?: string;
        path?: string;
        name?: string;
    }>;
    publishTime?: string;
    editTime?: string;
    authorInfo?: {
        name?: string;
    };
    threadUrl?: string;
    labelInfo?: {
        labelName?: string;
    };
    circleName?: string;
    imgInfoList?: ImageInfo[];
};

type ThreadDetailResponse = {
    errcode: string;
    errmsg?: string;
    data?: ThreadDetailData;
};

export const route: Route = {
    path: '/community/user/:userId',
    categories: ['bbs'],
    example: '/vmall/community/user/1000046347058',
    parameters: {
        userId: '用户 ID，可从个人主页 URL 获取',
    },
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
            source: ['cn.club.vmall.com/mhw/consumer/cn/community/mhwnews/bluevstore/'],
            target: (_, url) => {
                const match = new URL(url).pathname.match(/id_(\d+)/);
                return match ? `/community/user/${match[1]}` : '';
            },
        },
    ],
    name: '社区用户发帖',
    maintainers: ['zhaoshenzhai'],
    handler,
};

async function handler(ctx: Context): Promise<Data> {
    const { userId } = ctx.req.param();
    const [list, emojiMap] = await Promise.all([fetchUserPosts(userId), getEmojiMap()]);
    const items = await Promise.all(
        list.map((item) => {
            const threadId = item.threadIdStr || (item.threadId ? String(item.threadId) : '');
            const threadLink = item.threadShareUrl || (threadId ? `${siteRoot}/mhw/consumer/cn/community/mhwnews/article/id_${threadId}/` : undefined);

            if (!threadId || !threadLink) {
                return null;
            }

            const link = resolveSiteUrl(threadLink);

            return cache.tryGet(`vmall:thread:${threadId}`, async () => {
                const detail = await fetchThreadDetail(threadId);
                return buildItem(detail, item, link, emojiMap);
            });
        })
    );

    const filteredItems = items.filter((item): item is DataItem => item !== null);
    const author = list.find((item) => item.author)?.author;
    const title = author ? `华为花粉俱乐部 - ${author} 的发帖` : `华为花粉俱乐部 - 用户 ${userId} 发帖`;

    return {
        title,
        link: `${siteRoot}/mhw/consumer/cn/community/mhwnews/bluevstore/id_${userId}/`,
        item: filteredItems,
    };
}

function buildItem(detail: ThreadDetailData | undefined, fallback: ThreadListItem, link: string, emojiMap: Map<string, string>): DataItem {
    const title = detail?.subject || fallback.title || fallback.description || '话题';
    const publishTime = detail?.publishTime || detail?.editTime || fallback.dateline || fallback.updateTime;
    const content = renderContent(detail?.content, detail?.imgInfoList || [], detail?.links || [], emojiMap);
    const author = detail?.authorInfo?.name || fallback.author;
    const category = detail?.labelInfo?.labelName ? [detail.labelInfo.labelName] : undefined;

    return {
        title,
        link: detail?.threadUrl ? resolveSiteUrl(detail.threadUrl) : link,
        description: content,
        pubDate: publishTime ? parseDate(Number(publishTime)) : undefined,
        author,
        category,
    };
}

function renderContent(content: string | undefined, images: ImageInfo[] | undefined, links: ThreadDetailData['links'], emojiMap: Map<string, string>): string {
    const html = content || '';
    const linkMap = new Map<string, { path: string; name: string }>();

    for (const link of links || []) {
        if (link?.id && link.path) {
            linkMap.set(link.id, { path: resolveSiteUrl(link.path), name: link.name || link.path });
        }
    }

    const withEmoji = replaceEmojiPlaceholders(html, emojiMap);

    if (!images || images.length === 0) {
        return replaceLinkPlaceholders(withEmoji, linkMap);
    }

    const imageMap = new Map<string, string>();

    for (const image of images) {
        const src = image.path || image.mediumPath || image.thumbPath;

        if (!src) {
            continue;
        }

        const imageId = image.imgId || image.path?.match(/\/(\d+)(?:\.[a-z]+)?$/i)?.[1];

        if (imageId) {
            imageMap.set(imageId, resolveSiteUrl(src));
        }
    }

    if (imageMap.size === 0) {
        return replaceLinkPlaceholders(withEmoji, linkMap);
    }

    const withImages = withEmoji.replaceAll(/<img\s+id="(\d+)"\s*\/?>/gi, (raw, id) => {
        const src = imageMap.get(id);

        if (!src) {
            return '';
        }

        return `<img src="${src}">`;
    });

    return replaceLinkPlaceholders(withImages, linkMap);
}

function replaceEmojiPlaceholders(content: string, emojiMap: Map<string, string>): string {
    if (emojiMap.size === 0) {
        return content;
    }

    return content.replaceAll(/<emoj\s+id="([^"]+)"\s*\/?>/gi, (raw, id) => {
        const src = emojiMap.get(id);

        if (!src) {
            return '';
        }

        return `<img src="${src}">`;
    });
}

function replaceLinkPlaceholders(content: string, linkMap: Map<string, { path: string; name: string }>): string {
    if (linkMap.size === 0) {
        return content;
    }

    return content.replaceAll(/<link\s+id="(\d+)"\s*\/?>/gi, (raw, id) => {
        const link = linkMap.get(id);

        if (!link) {
            return '';
        }

        return `<a href="${link.path}">${link.name}</a>`;
    });
}

function resolveSiteUrl(url: string) {
    return new URL(url, siteRoot).href.replace(/^http:\/\//, 'https://');
}

async function fetchUserPosts(userId: string): Promise<ThreadListItem[]> {
    const response = await ofetch<ThreadListResponse>(`${apiRoot}/forward/club/content_h5/newsListByUserId/1`, {
        method: 'POST',
        headers: requestHeaders,
        body: {
            curPage: 1,
            pageSize: 20,
            userId,
        },
    });

    if (response.errcode !== '0') {
        throw new Error(`Failed to fetch user posts: ${response.errmsg || response.errcode}`);
    }

    return response.data?.threads || [];
}

async function fetchThreadDetail(threadId: string): Promise<ThreadDetailData | undefined> {
    const response = await ofetch<ThreadDetailResponse>(`${apiRoot}/forward/club/content_h5/queryThreadDetail/1`, {
        method: 'POST',
        headers: requestHeaders,
        body: {
            threadId,
            pageIndex: 1,
            pageSize: 20,
        },
    });

    if (response.errcode !== '0') {
        throw new Error(`Failed to fetch thread detail: ${response.errmsg || response.errcode}`);
    }

    return response.data;
}

function getEmojiMap(): Promise<Map<string, string>> {
    return cache.tryGet('vmall:emoji-map', async () => {
        const scriptUrl = await getEmojiScriptUrl();

        if (!scriptUrl) {
            return new Map();
        }

        const script = await ofetch<string, 'text'>(scriptUrl, {
            responseType: 'text',
            headers: {
                'User-Agent': config.trueUA,
            },
        });
        const mapMatch = script.match(/const jt=\{([\s\S]*?)\};/);

        if (!mapMatch) {
            return new Map();
        }

        const mapContent = mapMatch[1];
        const basePathMatch = script.match(/Wt="([^"]+)"/);
        const basePath = basePathMatch?.[1] || '/etc/designs/huawei-cbg-site/clientlib-forum/images';
        const host = 'https://clubstyle.club.vmall.com';
        const map = new Map<string, string>();
        const pattern = /"\{:(\d+_\d+):\}":"([^"]+)"/g;
        let match = pattern.exec(mapContent);

        while (match) {
            const key = match[1];
            const fileName = match[2];
            map.set(key, `${host}${basePath}/emotions/${fileName}`);
            match = pattern.exec(mapContent);
        }

        return map;
    });
}

function getEmojiScriptUrl(): Promise<string | undefined> {
    return cache.tryGet('vmall:emoji-script-url', async () => {
        const html = await ofetch<string, 'text'>(circleListUrl, {
            responseType: 'text',
            headers: {
                'User-Agent': config.trueUA,
            },
        });
        const matched = html.match(/https?:\/\/[^"' ]+chunk-common[^"' ]+\.js|\/[^"' ]+chunk-common[^"' ]+\.js/);

        return matched ? resolveSiteUrl(matched[0]) : undefined;
    });
}
