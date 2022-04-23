const got = require('@/utils/got');
const cache = require('./cache');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
module.exports = async (ctx) => {
    const uid = ctx.params.uid;
    const name = await cache.getUsernameFromUID(ctx, uid);
    const response = await got({
        method: 'get',
        url: `https://api.bilibili.com/x/space/article?mid=${uid}&pn=1&ps=10&sort=publish_time&jsonp=jsonp`,
        headers: {
            Referer: `https://space.bilibili.com/${uid}/`,
        },
    });
    const data = response.data.data;
    const title = `${name} 的 bilibili 专栏`;
    const link = `https://space.bilibili.com/${uid}/article`;
    const description = `${name} 的 bilibili 专栏`;
    const item = await Promise.all(
        data.articles.map(async (item) => {
            const art_url = `https://www.bilibili.com/read/cv${item.id}`;
            const itemData = await ctx.cache.tryGet(
                art_url,
                async () =>
                    (
                        await got({
                            method: 'get',
                            url: art_url,
                            headers: {
                                Referer: `https://space.bilibili.com/${uid}/`,
                            },
                        })
                    ).data
            );
            const content = cheerio.load(itemData);
            const eDescription = content('#read-article-holder').html();
            const publishDate = parseDate(item.publish_time * 1000);
            const single = {
                title: item.title,
                link: art_url,
                description: eDescription,
                pubDate: publishDate,
            };
            return single;
        })
    );
    ctx.state.data = {
        title,
        link,
        description,
        item,
    };
};
