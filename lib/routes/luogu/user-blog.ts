import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';

export const route: Route = {
    path: '/user/blog/:name',
    categories: ['programming'],
    example: '/luogu/user/blog/ftiasch',
    parameters: { name: '博客名称' },
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
            source: ['luogu.com.cn/blog/:name'],
        },
    ],
    name: '用户博客',
    maintainers: [],
    handler,
};

async function handler(ctx) {
    const name = ctx.req.param('name');

    const blogBaseUrl = `https://www.luogu.com.cn/blog/${name}/`;

    // Fetch the uid & title
    const { uid: blogUid, title: blogTitle } = await cache.tryGet(blogBaseUrl, async () => {
        const rsp = await got(blogBaseUrl);
        const $ = load(rsp.data);
        const uid = $("meta[name='blog-uid']").attr('content');
        const name = $("meta[name='blog-name']").attr('content');
        return {
            uid,
            title: `${name} - 洛谷博客`,
        };
    });

    const posts = (await got(`https://www.luogu.com.cn/api/blog/lists?uid=${blogUid}`).json()).data.result.map((r) => ({
        title: r.title,
        link: `${blogBaseUrl}${r.identifier}`,
        pubDate: new Date(r.postTime * 1000),
    }));

    // Get the full text
    const item = await Promise.all(
        posts.map((post) =>
            cache.tryGet(post.link, async () => {
                const rsp = await got(post.link);
                const $ = load(rsp.data);
                return {
                    title: post.title,
                    link: post.link,
                    pubDate: post.pubDate,
                    description: $('#article-content').html(),
                };
            })
        )
    );

    return {
        title: blogTitle,
        link: blogBaseUrl,
        item,
    };
}
