import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

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
            source: ['luogu.com/blog/:name'],
        },
        {
            source: ['luogu.com.cn/blog/:name'],
        },
    ],
    name: '用户博客',
    maintainers: ['ftiasch'],
    handler,
};

async function handler(ctx) {
    const name = ctx.req.param('name');

    const blogBaseUrl = `https://www.luogu.com.cn/blog/${name}/`;

    // Fetch the uid & title
    const { uid: blogUid, title: blogTitle } = await cache.tryGet(blogBaseUrl, async () => {
        const rsp = await ofetch(blogBaseUrl);
        const $ = load(rsp);
        const uid = $("meta[name='blog-uid']").attr('content');
        const name = $("meta[name='blog-name']").attr('content');
        return {
            uid,
            title: `${name} - 洛谷博客`,
        };
    });

    const posts = (await ofetch(`https://www.luogu.com.cn/api/blog/lists?uid=${blogUid}`)).data.result.map((r) => ({
        title: r.title,
        link: `${blogBaseUrl}${r.identifier}`,
        pubDate: new Date(r.postTime * 1000),
    }));

    // Get the full text
    const item = await Promise.all(
        posts.map((post) =>
            cache.tryGet(post.link, async () => {
                const rsp = await ofetch(post.link);
                const $ = load(rsp);
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
