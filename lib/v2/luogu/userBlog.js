const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const name = ctx.params.name;

    const blogBaseUrl = `https://www.luogu.com.cn/blog/${name}/`;

    // Fetch the uid & title
    const { uid: blogUid, title: blogTitle } = await ctx.cache.tryGet(blogBaseUrl, async () => {
        const rsp = await got(blogBaseUrl);
        const $ = cheerio.load(rsp.data);
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
            ctx.cache.tryGet(post.link, async () => {
                const rsp = await got(post.link);
                const $ = cheerio.load(rsp.data);
                return {
                    title: post.title,
                    link: post.link,
                    pubDate: post.pubDate,
                    description: $('#article-content').html(),
                };
            })
        )
    );

    ctx.state.data = {
        title: blogTitle,
        link: blogBaseUrl,
        item,
    };
};
