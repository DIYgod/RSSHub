import type { Context } from 'hono';

import type { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';

import { renderContent, tiebaClientRequest } from './common';

export const route: Route = {
    path: '/tieba/forum/:kw/:sortBy?',
    categories: ['bbs'],
    example: '/baidu/tieba/forum/孙笑川',
    parameters: { kw: '吧名', sortBy: '排序方式：`created`, `replied`。默认为 `created`' },
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
    name: '帖子列表',
    maintainers: ['u3u', 'FlanChanXwO'],
    handler,
};

function handler(ctx: Context) {
    const { kw, sortBy } = ctx.req.param();
    return getForumFeed(kw, { sortBy });
}

export const getForumFeed = async (kw: string, { cid = '0', sortBy = 'created', isGood = false } = {}) => {
    const data = await tiebaClientRequest('/c/f/frs/page', {
        kw,
        rn: '30',
        pn: '1',
        ...(isGood && { is_good: '1' }),
        ...(cid !== '0' && { cid }),
        ...(sortBy === 'replied' && { sort_type: '1' }),
    });

    const authorMap = new Map<number, string>(data.user_list.map((user) => [Number(user.id), user.name_show || user.name]));

    return {
        title: `${kw}吧`,
        link: `https://tieba.baidu.com/f?kw=${encodeURIComponent(kw)}`,
        item: data.thread_list.map((thread) => ({
            title: thread.title,
            link: `https://tieba.baidu.com/p/${thread.id}`,
            pubDate: parseDate(thread.create_time, 'X'),
            author: authorMap.get(Number(thread.author_id)),
            description: renderContent(thread.first_post_content || thread.abstract),
        })),
    };
};
