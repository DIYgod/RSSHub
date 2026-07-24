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

const stripHtml = (html: string): string => sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} });

// Build a feed item from the timeline list data alone (no detail request).
const buildListItem = (item: any) => ({
    title: item.title || stripHtml(item.description || ''),
    description: item.description || '',
    pubDate: parseDate(item.created_at),
    link: rootUrl + item.target,
});

const buildTitle = (item: any, detail: any): string => {
    if (item.title) {
        return item.title;
    }
    return stripHtml(item.text || item.description || detail.text || '');
};

const buildDescription = (detail: any): string => {
    let text = detail.text ?? detail.description;
    const images = detail.image_info_list ?? [];
    for (const img of images) {
        if (img?.filename) {
            text += `<br><img src="https://xqimg.imedao.com/${img.filename}">`;
        }
    }
    if (detail.retweeted_status) {
        text += `<blockquote>${detail.retweeted_status.user.screen_name}:&nbsp;${detail.retweeted_status.text}</blockquote>`;
    }
    return text;
};

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

    const data = response.statuses.filter((s) => s.mark !== 1); // 去除置顶动态

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

                    try {
                        const detail = await ofetch(`${apiUrl}/statuses/show.json`, {
                            query: { id: item.id },
                            headers: { Cookie: cookie, Referer: link },
                        });

                        return {
                            title: buildTitle(item, detail),
                            description: buildDescription(detail),
                            pubDate: parseDate(item.created_at),
                            link: rootUrl + item.target,
                        };
                    } catch (error: any) {
                        // Permanent failures (post deleted / not found): cache the fallback.
                        const data = error.response?._data || error.data;
                        if (data && typeof data === 'object' && data.error_code) {
                            return buildListItem(item);
                        }
                        // Transient failures (rate limit / WAF): throw to skip caching, retry next request.
                        throw error;
                    }
                });
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
