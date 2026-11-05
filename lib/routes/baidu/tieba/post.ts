import type { Context } from 'hono';

import type { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';

import { renderContent, tiebaClientRequest } from './common';

/**
 * 获取最新的帖子回复（倒序查看）
 *
 * @param {*} id 帖子ID
 * @param {number} [lz=0] 是否只看楼主（0: 查看全部, 1: 只看楼主）
 * 帖子最大页码（默认假设为 7e6，如果超出假设则根据返回的最大页码再请求一次，否则可以节省一次请求）
 * 这个默认值我测试下来 7e6 是比较接近最大值了，因为当我输入 8e6 就会返回第一页的数据而不是最后一页了
 * @returns
 */
const getPost = async (id: string, lz: 0 | 1) =>
    await tiebaClientRequest('/c/f/pb/page', {
        kz: id,
        pn: String(7e6),
        rn: '30',
        r: '1',
        lz: String(lz),
    });

export const route: Route = {
    path: '/tieba/post/:id',
    categories: ['bbs'],
    example: '/baidu/tieba/post/686961453',
    parameters: { id: '帖子 ID' },
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
    radar: [
        {
            source: ['tieba.baidu.com/p/:id'],
        },
    ],
    name: '帖子动态',
    maintainers: ['u3u', 'FlanChanXwO'],
    handler,
};

function handler(ctx: Context) {
    const { id } = ctx.req.param();
    return getPostFeed(id, 0);
}

export const getPostFeed = async (id: string, lz: 0 | 1) => {
    const data = await getPost(id, lz);

    const title = data.thread.title;
    const authorMap = new Map<number, string>(data.user_list.map((user) => [Number(user.id), user.name_show || user.name]));

    return {
        title: lz ? `【只看楼主】${title}` : title,
        link: `https://tieba.baidu.com/p/${id}?see_lz=${lz}`,
        description: `${title}的最新回复`,
        item: data.post_list.map((post) => {
            const author = authorMap.get(Number(post.author_id));
            return {
                title: `${author} 回复了帖子《${title}》`,
                description: `${renderContent(post.content)}<p>楼层：${post.floor}楼</p>`,
                pubDate: parseDate(post.time, 'X'),
                author,
                link: `https://tieba.baidu.com/p/${id}?pid=${post.id}#${post.id}`,
            };
        }),
    };
};
