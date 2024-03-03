// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';

export default async (ctx) => {
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

    ctx.set('data', {
        title: blogTitle,
        link: blogBaseUrl,
        item,
    });
};
