import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { renderContent, tiebaClientRequest } from './common';

export const route: Route = {
    path: '/tieba/user/:uid',
    categories: ['bbs'],
    example: '/baidu/tieba/user/斗鱼游戏君',
    parameters: { uid: '用户 ID' },
    features: {
        requireConfig: [
            {
                name: 'BAIDU_COOKIE',
                optional: true,
                description: '百度 cookie 值，用于需要登录的贴吧页面',
            },
        ],
        antiCrawler: true,
    },
    name: '用户帖子',
    maintainers: ['igxlin', 'nczitzk', 'FlanChanXwO'],
    handler,
    description: '用户 ID 可以通过打开用户的主页后查看地址栏的 `un` 字段来获取。',
};

async function handler(ctx: Context) {
    const { uid } = ctx.req.param();
    const link = `https://tieba.baidu.com/home/main?un=${encodeURIComponent(uid)}`;

    const userJson = await ofetch(`https://tieba.baidu.com/i/sys/user_json?un=${encodeURIComponent(uid)}&ie=utf-8`);
    if (!userJson) {
        throw new Error(`Tieba user ${uid} not found`);
    }
    const userId = JSON.parse(userJson).id;

    const data = await tiebaClientRequest('/c/u/feed/userpost', {
        uid: String(userId),
        pn: '1',
        rn: '20',
        is_thread: '1',
        need_content: '1',
    });

    return {
        title: `${uid} 的贴吧`,
        link,
        item: data.post_list.map((post) => ({
            title: post.title,
            description: renderContent(post.first_post_content || post.abstract),
            author: post.name_show,
            pubDate: parseDate(post.create_time, 'X'),
            link: `https://tieba.baidu.com/p/${post.thread_id}`,
        })),
    };
}
