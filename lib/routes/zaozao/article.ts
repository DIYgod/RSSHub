import { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import got from '@/utils/got';

export const route: Route = {
    path: '/article/:type?',
    categories: ['programming'],
    example: '/zaozao/article/quality',
    parameters: { type: '文章分类' },
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
            source: ['www.zaozao.run/article/:type'],
            target: '/article/:type',
        },
    ],
    name: '文章',
    maintainers: ['shaomingbo'],
    handler,
    description: `| 精品推荐  | 技术干货 | 职场成长 | 社区动态  | 组件物料 | 行业动态 |
| --------- | -------- | -------- | --------- | -------- | -------- |
| recommend | quality  | growth   | community | material | industry |`,
};

async function handler(ctx) {
    const { type = 'recommend' } = ctx.req.param();
    const response = await got({
        method: 'put',
        url: `https://e.zaozao.run/article/page/${type}`,
        headers: {
            Referer: `https://www.zaozao.run/`,
        },
        body: JSON.stringify({
            pageNo: 1,
            pageSize: 100,
        }),
    });

    const { status, statusMessage } = response;
    if (status !== 200) {
        throw new Error(statusMessage);
    }

    const { data } = response.data;

    return {
        title: `前端早早聊 - 文章`,
        link: `https://www.zaozao.run/article/${type}`,
        description: `前端早早聊 - 文章`,
        item: data.map((item) => ({
            title: item.title,
            link: item.url,
            author: item.recommenderName,
            pubDate: parseDate(item.updateAt),
        })),
    };
}
