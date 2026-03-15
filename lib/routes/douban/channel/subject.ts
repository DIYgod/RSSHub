import type { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/channel/:id/subject/:nav',
    categories: ['social-media'],
    example: '/douban/channel/30168934/subject/0',
    parameters: { id: '频道id', nav: '书影音分类' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '频道书影音',
    maintainers: ['umm233'],
    handler,
    description: `| 电影 | 电视剧 | 图书 | 唱片 |
| ---- | ------ | ---- | ---- |
| 0    | 1      | 2    | 3    |`,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const nav = ctx.req.param('nav');
    const link = `https://www.douban.com/subject/${id}`;

    const channel_info_response = await got({
        method: 'get',
        url: `https://m.douban.com/rexxar/api/v2/elessar/channel/${id}`,
        headers: {
            Referer: link,
        },
    });

    const response = await got({
        method: 'get',
        url: `https://m.douban.com/rexxar/api/v2/elessar/channel/${id}/subjects?ck=null&for_mobile=1`,
        headers: {
            Referer: link,
        },
    });

    const channel_name = channel_info_response.data.title;
    const data = response.data.modules[nav].payload.subjects;
    let nav_name: string;

    switch (nav) {
        case '0':
            nav_name = '电影';
            break;
        case '1':
            nav_name = '电视剧';
            break;
        case '2':
            nav_name = '书籍';
            break;
        case '3':
            nav_name = '唱片';
            break;
        default:
            throw new Error(`Unknown nav: ${nav}`);
    }

    return {
        title: `豆瓣${channel_name}频道-${nav_name}推荐`,
        link,
        description: `豆瓣${channel_name}频道书影音下的${nav_name}推荐`,

        item: data.map(({ title, extra, cover_img, url }) => {
            const rate = extra.rating_group.rating ? `${extra.rating_group.rating.value.toFixed(1)}分` : extra.rating_group.null_rating_reason;

            const description = `标题：${title} <br> 信息：${extra.short_info} <br> 评分：${rate} <br> <img src="${cover_img.url}">`;

            return {
                title,
                description,
                link: url,
            };
        }),
    };
}
