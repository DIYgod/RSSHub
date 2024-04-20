import { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/user/:id/threads',
    categories: ['bbs'],
    example: '/1point3acres/user/1/threads',
    parameters: { id: '用户 id，可在 Instant 版网站的个人主页 URL 找到' },
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
            source: ['instant.1point3acres.com/profile/:id', 'instant.1point3acres.com/'],
        },
    ],
    name: '用户主题帖',
    maintainers: ['Maecenas'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');

    const { threads } = (await got.get(`https://instant.1point3acres.com/v2/api/user/thread?pg=1&ps=10&user_id=${id}`)).data;
    const [{ author_name: author }] = threads;

    return {
        title: `${author}的主题帖 - 一亩三分地`,
        link: `https://instant.1point3acres.com/profile/${id}`,
        description: `${author}的主题帖 - 一亩三分地`,
        item: threads.map((item) => ({
            title: item.title,
            author,
            description: item.description,
            pubDate: new Date(item.update_time + ' GMT+8').toUTCString(),
            link: `https://instant.1point3acres.com/thread/${item.id}`,
        })),
    };
}
