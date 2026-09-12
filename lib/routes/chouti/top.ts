import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/top/:hour?',
    categories: ['new-media'],
    example: '/chouti/top/24',
    parameters: {
        hour: '排行榜周期，可选 24 72 168 三种，默认 24',
    },
    name: '最热榜 TOP10',
    maintainers: ['DIYgod'],
    handler,
};

async function handler(ctx: Context) {
    const { hour = '24' } = ctx.req.param();

    const response = await ofetch(`https://dig.ichouti.cn/top/${hour}hr?_=${Date.now()}`);

    const resultItem = response.data.map((item) => ({
        title: item.title,
        author: item.submitted_user?.nick,
        description: `${item.original_img_url || item.img_url ? `<br><img src="${item.original_img_url || item.img_url}">` : ''}<br><a href="https://dig.ichouti.cn/link/${item.id}">评论</a>`,
        link: item.url,
        pubDate: parseDate(item.created_time / 1000),
    }));

    return {
        title: `抽屉新热榜-${hour}小时最热榜`,
        description: '抽屉新热榜，汇聚每日搞笑段子、热门图片、有趣新闻。它将微博、门户、社区、bbs、社交网站等海量内容聚合在一起，通过用户推荐生成最热榜单。看抽屉新热榜，每日热门、有趣资讯尽收眼底。',
        link: 'https://dig.ichouti.cn/',
        item: resultItem,
    };
}
