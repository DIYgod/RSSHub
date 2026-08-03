import { FetchError } from 'ofetch';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { getAcwScV2ByArg1 } from '../5eplay/utils';

export const route: Route = {
    path: '/articles/:type',
    categories: ['blog'],
    example: '/freebuf/articles/web',
    parameters: { type: '文章类别' },
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
            source: ['freebuf.com/articles/:type/*.html', 'freebuf.com/articles/:type'],
        },
    ],
    name: '文章',
    maintainers: ['trganda'],
    handler,
    description: `::: tip
Freebuf 的文章页面带有反爬虫机制，所以目前无法获取文章的完整内容。

站点位于阿里云 WAF 之后，请求频繁的 IP 可能触发 405 JS 质询，此时路由会自动计算 \`acw_sc__v2\` Cookie 并重试。
:::`,
};

async function handler(ctx) {
    const { type = 'web' } = ctx.req.param();

    const fapi = 'https://www.freebuf.com/fapi/frontend/category/list';
    const baseUrl = 'https://www.freebuf.com';
    const rssLink = `${baseUrl}/articles/${type}`;

    const options = {
        headers: {
            accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        },
        query: {
            name: type,
            page: 1,
            limit: 20,
            select: 0,
            order: 0,
            type: 'category',
        },
    };

    const response = await fetchWithAcwChallenge(fapi, options);

    const items = response.data.data_list.map((item) => ({
        title: item.post_title,
        link: `${baseUrl}${item.url}`,
        description: item.content,
        pubDate: parseDate(item.post_date),
        author: item.nickname,
    }));

    return {
        title: `Freebuf ${type}`,
        link: rssLink,
        item: items,
    };
}

// 阿里云 WAF 会对被风控的 IP 返回 405 JS 质询，需计算 acw_sc__v2 Cookie 后重试
async function fetchWithAcwChallenge(url, options) {
    try {
        return await ofetch(url, options);
    } catch (error) {
        const arg1 = error instanceof FetchError && typeof error.data === 'string' ? error.data.match(/var arg1='(.*?)';/)?.[1] : undefined;
        if (!arg1) {
            throw error;
        }
        return await ofetch(url, {
            ...options,
            headers: {
                ...options.headers,
                cookie: `acw_sc__v2=${getAcwScV2ByArg1(arg1)}`,
            },
        });
    }
}
