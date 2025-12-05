import type { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/user/:id/posts',
    categories: ['bbs'],
    example: '/1point3acres/user/1/posts',
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
    name: '用户回帖',
    maintainers: ['Maecenas'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');

    const { posts } = (await got.get(`https://instant.1point3acres.com/v2/api/user/post?pg=1&ps=10&user_id=${id}`)).data;
    const [{ author_name: author }] = posts;

    return {
        title: `${author}的回复 - 一亩三分地`,
        link: `https://instant.1point3acres.com/profile/${id}`,
        description: `${author}的回复 - 一亩三分地`,
        item: posts.map((item) => ({
            title: item.message,
            author,
            description: item.message,
            pubDate: new Date(item.create_time + ' GMT+8').toUTCString(),
            link: `https://instant.1point3acres.com/thread/${item.thread_id}/post/${item.id}`,
        })),
    };
}
