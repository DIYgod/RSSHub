import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:id/:type/:sort?',
    categories: ['new-media'],
    example: '/nosetime/59247733/discuss/new',
    parameters: {
        id: '用户id，可在用户主页 URL 中找到',
        type: '类型，short 一句话香评  discuss 香评',
        sort: '排序， new 最新  agree 最有用',
    },
    features: {
        antiCrawler: true,
    },
    name: '香评',
    maintainers: ['kt286'],
    handler,
};

async function handler(ctx: Context) {
    const { id, type = 'discuss', sort = 'new' } = ctx.req.param();

    const link = `https://www.nosetime.com/member/member_comment.php?id=${id}&type=${type}&o=${sort}`;
    const headers = {
        Referer: link,
        'Content-Type': 'application/json;charset=utf-8',
    };

    const userinfo = await ofetch('https://www.nosetime.com/app/user.php', {
        method: 'POST',
        headers,
        responseType: 'json',
        body: {
            method: 'getsocialinfo',
            id,
        },
    });

    const response = await ofetch('https://www.nosetime.com/app/user.php', {
        method: 'POST',
        headers,
        responseType: 'json',
        body: {
            method: `getweb${type}`,
            id,
            orderby: sort,
            page: 1,
        },
    });

    return {
        title: `香水时代 - ${userinfo.uname}`,
        link,
        description: userinfo.udesc,
        item: response.items.map((item) => ({
            title: `${'★★★★★☆☆☆☆☆'.slice(5 - item.score, 10 - item.score)} ${item.name}`,
            description: item.content,
            pubDate: parseDate(item.time),
            link: `https://www.nosetime.com/xiangshui/${item.id}-${item.iurl}.html`,
            author: userinfo.uname,
        })),
    };
}
