const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const username = ctx.params.username;

    // Convert from `username` to `uid`
    const userApiUrl = `https://www.luogu.com.cn/api/user/search?keyword=${username}`;
    const uid = await ctx.cache.tryGet(userApiUrl, async () => {
        const rsp = await got(userApiUrl).json();
        return rsp.users[0].uid;
    });

    // Get the title and link from the sitemap
    const sitemapUrl = `https://www.luogu.com.cn/blog/${username}/_sitemap`;
    const { title: blogTitle, link: blogBaseUrl } = await ctx.cache.tryGet(sitemapUrl, async () => {
        const rsp = await got(sitemapUrl);
        const $ = cheerio.load(rsp.data);
        const title = $('title').text();
        const link = $('.am-alert > a').attr('href');
        return {
            title,
            link,
        };
    });

    const posts = (await got(`https://www.luogu.com.cn/api/blog/lists?uid=${uid}`).json()).data.result.map((r) => ({
        title: r.title,
        link: `${blogBaseUrl}${r.identifier}`,
        pubDate: new Date(r.postTime * 1000),
    }));

    // Get the full text
    const item = await Promise.all(
        posts.map((post) =>
            ctx.cache.tryGet(post.link, async () => {
                const rsp = await got.get(post.link);
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
