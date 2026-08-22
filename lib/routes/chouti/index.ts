import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:subject?',
    categories: ['new-media'],
    example: '/chouti/hot',
    parameters: {
        subject: '主题名称',
    },
    name: '最新',
    maintainers: ['xyqfer'],
    description: `| 热榜 | 42 区 | 段子  | 图片 | 挨踢 1024 | 你问我答 |
| ---- | ----- | ----- | ---- | --------- | -------- |
| hot  | news  | scoff | pic  | tec       | ask      |`,
    handler,
};

async function handler(ctx: Context) {
    const { subject = 'hot' } = ctx.req.param();
    const host = 'https://m.ichouti.cn';
    let api = `${host}/api/m/zone/${subject}?afterTime=0`;
    let pageUrl = `https://m.ichouti.cn/zone/${subject}`;
    if (subject === 'hot') {
        api = `${host}/api/m/link/hot?afterTime=0`;
        pageUrl = 'https://m.ichouti.cn/all/hot';
    }

    const response = await ofetch(api);

    const resultItem = response.data.map((item) => ({
        title: item.title,
        author: item.submitted_user?.nick,
        description: `${item.original_img_url || item.img_url ? `<br><img src="${item.original_img_url || item.img_url}">` : ''}<br><a href="${host}/link/${item.id}">评论</a>`,
        link: item.url,
        pubDate: parseDate(item.created_time / 1000),
    }));

    return {
        title: '抽屉新热榜',
        description: '抽屉新热榜，汇聚每日搞笑段子、热门图片、有趣新闻。它将微博、门户、社区、bbs、社交网站等海量内容聚合在一起，通过用户推荐生成最热榜单。看抽屉新热榜，每日热门、有趣资讯尽收眼底。',
        link: pageUrl,
        item: resultItem,
    };
}
