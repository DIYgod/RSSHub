import queryString from 'query-string';

import { config } from '@/config';
import type { Route } from '@/types';
import got from '@/utils/got';

import { bbcodeToHtml } from '../utils';

const BANGUMI_API_BASE = 'https://next.bgm.tv/p1';

export const route: Route = {
    path: '/user/blog/:id',
    categories: ['anime'],
    example: '/bangumi.tv/user/blog/sai',
    parameters: { id: '用户 id, 在用户页面地址栏查看' },
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
            source: ['bgm.tv/user/:id'],
        },
        {
            source: ['bangumi.tv/user/:id'],
        },
    ],
    name: '用户日志',
    maintainers: ['nczitzk', 'muzuiyo'],
    handler,
};

async function fetchBlogList(user: string, limit = 20, offset = 0) {
    const url = `${BANGUMI_API_BASE}/users/${user}/blogs`;
    const response = await got({
        method: 'get',
        url,
        searchParams: queryString.stringify({
            limit,
            offset,
        }),
        headers: {
            Accept: 'application/json',
            'User-Agent': config.trueUA,
        },
    });
    return response.data;
}

async function fetchBlogDetail(blogId: number) {
    const url = `${BANGUMI_API_BASE}/blogs/${blogId}`;
    const response = await got({
        method: 'get',
        url,
        headers: {
            Accept: 'application/json',
            'User-Agent': config.trueUA,
        },
    });
    return response.data;
}

async function handler(ctx) {
    const user = ctx.req.param('id');
    const limit = ctx.req.query('limit') ? Math.min(Number.parseInt(ctx.req.query('limit'), 10) || 20, 20) : 20;
    const offset = 0;

    // 获取日志列表
    const blogListData = await fetchBlogList(user, limit, offset);
    if (!blogListData.data || blogListData.data.length === 0) {
        return {
            title: `${user} 的日志`,
            link: `https://bgm.tv/user/${user}/blogs`,
            item: [],
        };
    }

    // 并行获取日志详情
    const detailPromises = blogListData.data.map((blog) => fetchBlogDetail(blog.id));
    const blogs = await Promise.all(detailPromises);

    // 获取用户昵称
    const nickname = blogs[0].user.nickname || user;

    const items = blogs.map((item) => ({
        title: item.title,
        link: `https://bgm.tv/blog/${item.id}`,
        description: bbcodeToHtml(item.content) || '',
        // API 内的 createdAt 是秒级 Unix 时间戳，乘 1000 转为毫秒
        pubDate: new Date(item.createdAt * 1000),
        author: nickname,
        category: (item.tags ?? []).map((tag) => tag.name),
    }));

    return {
        title: `${nickname} 的日志`,
        link: `https://bgm.tv/user/${user}/blogs`,
        item: items,
    };
}
