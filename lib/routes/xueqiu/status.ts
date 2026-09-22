import sanitizeHtml from 'sanitize-html';

import { parseToken } from '@/routes/xueqiu/cookies';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://xueqiu.com';
const apiUrl = 'https://api.xueqiu.com';

export const route: Route = {
    path: '/status/:uid/:id',
    categories: ['finance'],
    example: '/xueqiu/status/8152922548/409443228',
    parameters: {
        uid: '用户 id，可在动态页 URL 中找到',
        id: '动态 id，可在动态页 URL 中找到',
    },
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
            source: ['xueqiu.com/:uid/:id'],
            target: '/status/:uid/:id',
        },
    ],
    name: '动态详情',
    maintainers: ['ruesin'],
    handler,
    url: 'xueqiu.com',
    description: '获取单条动态或专栏文章的完整内容（列表类路由的 description 只有截断预览，需要全文时用本路由按动态页 URL 逐条获取）。',
};

const stripHtml = (html: string): string => sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} });

async function handler(ctx) {
    const { uid, id } = ctx.req.param();
    const link = `${rootUrl}/${uid}/${id}`;
    const cookie = await parseToken(link);

    const detail: any = await cache.tryGet(`xueqiu:detail:${id}`, async () => {
        const response = await ofetch(`${apiUrl}/statuses/show.json`, {
            query: { id },
            headers: { Cookie: cookie, Referer: link },
        });
        // 限频时雪球可能返回 200 但内容为空，当作瞬时错误抛出，避免空结果被缓存
        if (!response?.text && !response?.description && !(response?.image_info_list ?? []).length) {
            throw new Error('xueqiu show.json returned empty content, likely rate limited');
        }
        return response;
    });

    if (!detail?.id) {
        throw new Error('Article not found');
    }

    let description = detail.text || detail.description || '';
    // 文章正文已内嵌的图片不再从附图列表重复追加
    const images = (detail.image_info_list ?? []).filter((img) => img?.filename && !description.includes(img.filename));
    for (const img of images) {
        description += `<br><img src="https://xqimg.imedao.com/${img.filename}">`;
    }
    if (detail.retweeted_status) {
        description += `<blockquote>${detail.retweeted_status.user.screen_name}:&nbsp;${detail.retweeted_status.text}</blockquote>`;
    }

    return {
        title: `${detail.user?.screen_name ?? uid} 的雪球文章`,
        link,
        item: [
            {
                title: detail.title || stripHtml(description) || `动态 ${id}`,
                description,
                pubDate: parseDate(detail.created_at),
                link,
                author: detail.user?.screen_name,
            },
        ],
    };
}
